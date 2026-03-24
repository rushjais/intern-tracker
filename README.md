# Financial Transaction Pattern Analyzer

Detecting unusual spending behavior in business transaction data using feature engineering and unsupervised anomaly detection.

---

## Overview

> **Problem:** Given transaction data for businesses, can we identify unusual spending patterns that may indicate fraud, accounting errors, or behavior shifts?

This project explores that question through a realistic exploratory prototype — not a production system. The emphasis is on **feature engineering and interpretability**, not model complexity.

## Notebook

Open [`transaction_analysis.ipynb`](transaction_analysis.ipynb) to see the full analysis:

1. Synthetic dataset generation (6,400 transactions, 5 businesses, 12 months)
2. Exploratory analysis
3. Feature engineering — 10 contextual features
4. Three anomaly detection methods compared
5. Visualizations and results
6. Honest limitations and next steps

## Key Idea

Raw transaction amounts are poor anomaly signals. A \$10,000 payment is routine for one business and alarming for another. The interesting work is building **context-aware features**:

| Feature | What it captures |
|---|---|
| `amount_zscore_biz` | Unusual for *this account's* history? |
| `amount_zscore_vendor` | Unusual for *this vendor relationship*? |
| `is_new_vendor` | First-ever payment to this payee? |
| `rolling_7d_count` | Transaction frequency spike this week? |
| `is_near_duplicate` | Same amount + same vendor within 48 hrs? |

## Quickstart

```bash
git clone https://github.com/YOUR_USERNAME/transaction-pattern-analyzer
cd transaction-pattern-analyzer
pip install -r requirements.txt
jupyter notebook transaction_analysis.ipynb
```

## Methods Compared

| Method | Description |
|---|---|
| Rule-based scoring | Human-readable thresholds, fully auditable |
| Z-score composite | Statistical baseline, SQL-friendly |
| Isolation Forest | Tree-based unsupervised ML |

All three are evaluated at the 98th-percentile threshold against ground-truth labels.

## Stack

Python · pandas · NumPy · scikit-learn · matplotlib

---

*A portfolio project exploring anomaly detection in a fintech/business banking context.*
