# Fine-tuning Qwen2.5-3B for ResumeAuditor

## Overview
This guide explains how to fine-tune Qwen2.5-3B for resume analysis and career guidance tasks.

## Hardware Requirements
- **Your Setup:** RTX 4050 (4GB VRAM), 16GB RAM, i7-13620H
- **Method:** QLoRA (4-bit quantization + LoRA)
- **Estimated Training Time:** 1-2 hours per task

## Dataset Structure

### Task 1: Resume Analysis (`data/resume_analysis.jsonl`)
```json
{"messages": [
  {"role": "system", "content": "You are a professional resume analyst. Analyze resumes and provide structured JSON feedback."},
  {"role": "user", "content": "Analyze this resume for a Software Engineer position:\n\n[Resume Text]"},
  {"role": "assistant", "content": "{\"score\": 75, \"strengths\": [...], \"weaknesses\": [...], \"ats_compatibility\": 80}"}
]}
```

### Task 2: Career Guidance (`data/career_guidance.jsonl`)
```json
{"messages": [
  {"role": "system", "content": "You are a career counselor. Provide personalized career advice based on the user's background."},
  {"role": "user", "content": "I'm a 25-year-old with 2 years in data entry. I want to transition to data science. What should I do?"},
  {"role": "assistant", "content": "Here's your 6-month transition plan:\n\n1. **Month 1-2:** Learn Python fundamentals..."}
]}
```

### Task 3: Resume Generation (`data/resume_generation.jsonl`)
```json
{"messages": [
  {"role": "system", "content": "You are a professional resume writer. Generate ATS-optimized resumes."},
  {"role": "user", "content": "Create a resume for: John Doe, 3 years Python developer, worked at StartupX"},
  {"role": "assistant", "content": "# JOHN DOE\nSoftware Engineer | Python Specialist\n\n## PROFESSIONAL SUMMARY\nResults-driven..."}
]}
```

### Task 4: Outreach Messages (`data/outreach_messages.jsonl`)
```json
{"messages": [
  {"role": "system", "content": "You are an expert at writing professional outreach messages that get responses."},
  {"role": "user", "content": "Write a LinkedIn connection request to a hiring manager at Google for a SWE role"},
  {"role": "assistant", "content": "Hi [Name],\n\nI noticed Google's recent work on [specific project]..."}
]}
```

### Task 5: Salary Negotiation (`data/salary_negotiation.jsonl`)
```json
{"messages": [
  {"role": "system", "content": "You are a salary negotiation coach. Provide scripts and strategies for negotiating compensation."},
  {"role": "user", "content": "I got an offer for $80k but the market rate is $95k. How do I negotiate?"},
  {"role": "assistant", "content": "Here's your negotiation script:\n\n**Opening:** \"Thank you for the offer...\""}
]}
```

## Data Collection Strategy

### Sources for Training Data:
1. **Reddit:** r/resumes, r/careerguidance, r/cscareerquestions
2. **Kaggle:** Resume datasets
3. **Synthetic:** Generate with GPT-4 or Claude
4. **Your App Usage:** Log (with consent) real interactions

### Recommended Dataset Sizes:
| Task | Minimum | Recommended |
|------|---------|-------------|
| Resume Analysis | 500 | 2,000 |
| Career Guidance | 300 | 1,000 |
| Resume Generation | 200 | 500 |
| Outreach Messages | 200 | 500 |
| Salary Negotiation | 100 | 300 |

## Fine-tuning with Unsloth (Recommended)

### Installation
```bash
pip install unsloth
pip install --no-deps trl peft accelerate bitsandbytes
```

### Training Script
See `train.py` for the full training script.

### Convert to Ollama
```bash
# After training, convert to GGUF
python -m unsloth.save_to_gguf --model ./output --output ./resume-auditor.gguf

# Create Ollama model
ollama create resume-auditor -f Modelfile
```

## Quick Start

1. Prepare your data in `data/` folder
2. Run `python train.py`
3. Convert to GGUF
4. Load in Ollama
5. Update ResumeAuditor settings to use your model!
