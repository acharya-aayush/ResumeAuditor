# Fine-tuning Training Script for ResumeAuditor
# Optimized for RTX 4050 (4GB VRAM) using QLoRA

import os
import torch
from datasets import load_dataset, concatenate_datasets
from unsloth import FastLanguageModel
from trl import SFTTrainer
from transformers import TrainingArguments

# ============================================
# CONFIGURATION
# ============================================
MODEL_NAME = "unsloth/Qwen2.5-3B-Instruct-bnb-4bit"  # Pre-quantized for low VRAM
OUTPUT_DIR = "./output/resume-auditor-v1"
MAX_SEQ_LENGTH = 2048
BATCH_SIZE = 1  # Keep low for 4GB VRAM
GRADIENT_ACCUMULATION = 8  # Effective batch size = 8
LEARNING_RATE = 2e-4
NUM_EPOCHS = 3
LORA_R = 16
LORA_ALPHA = 32

# ============================================
# LOAD MODEL WITH 4-BIT QUANTIZATION
# ============================================
print("Loading model...")
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name=MODEL_NAME,
    max_seq_length=MAX_SEQ_LENGTH,
    dtype=None,  # Auto-detect
    load_in_4bit=True,  # Essential for 4GB VRAM
)

# ============================================
# APPLY LORA ADAPTERS
# ============================================
print("Applying LoRA...")
model = FastLanguageModel.get_peft_model(
    model,
    r=LORA_R,
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj",
                    "gate_proj", "up_proj", "down_proj"],
    lora_alpha=LORA_ALPHA,
    lora_dropout=0.05,
    bias="none",
    use_gradient_checkpointing="unsloth",  # Saves VRAM
    random_state=42,
)

# ============================================
# LOAD AND PREPARE DATASETS
# ============================================
print("Loading datasets...")

def load_jsonl_dataset(filepath):
    """Load a JSONL file as a dataset."""
    if os.path.exists(filepath):
        return load_dataset("json", data_files=filepath, split="train")
    return None

# Load all task datasets
datasets = []
data_files = [
    "data/resume_analysis.jsonl",
    "data/career_guidance.jsonl",
    "data/resume_generation.jsonl",
    "data/outreach_messages.jsonl",
    "data/salary_negotiation.jsonl",
]

for filepath in data_files:
    ds = load_jsonl_dataset(filepath)
    if ds:
        datasets.append(ds)
        print(f"  Loaded {filepath}: {len(ds)} examples")

if not datasets:
    print("ERROR: No datasets found in data/ folder!")
    print("Please create JSONL files with training data.")
    exit(1)

# Combine all datasets
combined_dataset = concatenate_datasets(datasets)
print(f"Total training examples: {len(combined_dataset)}")

# ============================================
# FORMAT FOR CHAT TEMPLATE
# ============================================
def format_chat(example):
    """Format messages into chat template."""
    messages = example.get("messages", [])
    text = tokenizer.apply_chat_template(
        messages,
        tokenize=False,
        add_generation_prompt=False
    )
    return {"text": text}

formatted_dataset = combined_dataset.map(format_chat)

# ============================================
# TRAINING CONFIGURATION
# ============================================
print("Setting up trainer...")
training_args = TrainingArguments(
    output_dir=OUTPUT_DIR,
    num_train_epochs=NUM_EPOCHS,
    per_device_train_batch_size=BATCH_SIZE,
    gradient_accumulation_steps=GRADIENT_ACCUMULATION,
    learning_rate=LEARNING_RATE,
    weight_decay=0.01,
    warmup_ratio=0.1,
    lr_scheduler_type="cosine",
    logging_steps=10,
    save_strategy="epoch",
    fp16=True,  # Use FP16 for RTX 4050
    optim="adamw_8bit",  # Memory-efficient optimizer
    seed=42,
    report_to="none",  # Disable wandb
)

trainer = SFTTrainer(
    model=model,
    tokenizer=tokenizer,
    train_dataset=formatted_dataset,
    dataset_text_field="text",
    max_seq_length=MAX_SEQ_LENGTH,
    args=training_args,
)

# ============================================
# TRAIN!
# ============================================
print("Starting training...")
print(f"  Model: {MODEL_NAME}")
print(f"  LoRA rank: {LORA_R}")
print(f"  Epochs: {NUM_EPOCHS}")
print(f"  Effective batch size: {BATCH_SIZE * GRADIENT_ACCUMULATION}")

trainer.train()

# ============================================
# SAVE MODEL
# ============================================
print("Saving model...")
model.save_pretrained(OUTPUT_DIR)
tokenizer.save_pretrained(OUTPUT_DIR)

# ============================================
# EXPORT TO GGUF FOR OLLAMA
# ============================================
print("Exporting to GGUF...")
model.save_pretrained_gguf(
    OUTPUT_DIR,
    tokenizer,
    quantization_method="q4_k_m"  # Good balance of size/quality
)

print(f"""
============================================
TRAINING COMPLETE!
============================================

Your fine-tuned model is saved at: {OUTPUT_DIR}

To use with Ollama:
1. Copy the GGUF file to a Modelfile
2. Run: ollama create resume-auditor -f Modelfile

See finetuning/Modelfile for the template.
""")
