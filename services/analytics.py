# tính toán stats

def get_dataset_summary(df, target_col="target"):
    summary = {}

    # Basic info
    summary["num_rows"] = int(df.shape[0])
    summary["num_cols"] = int(df.shape[1])

    # Target distribution
    if target_col in df.columns:
        dist = df[target_col].value_counts().sort_index().to_dict()
        summary["target_distribution"] = {
            str(k): int(v) for k, v in dist.items()
        }
    else:
        summary["target_distribution"] = {}

    # Missing values
    missing = df.isnull().sum().to_dict()
    summary["missing_values"] = {
        k: int(v) for k, v in missing.items()
    }

    return summary