 # đọc parquet từ Azure

import pandas as pd
import os

# =========================
# CONFIG AZURE
# =========================
DATA_URL = "abfs://dropout-train@nycyellowtaxiea.dfs.core.windows.net/train_data_only1/"


_df_cache = None


def load_data():
    global _df_cache

    if _df_cache is None:
        try:
            print("Loading data from Azure Data Lake...")

            _df_cache = pd.read_parquet(
                DATA_URL,
                engine="pyarrow",
                storage_options=STORAGE_OPTIONS
            )

            print("Data loaded:", _df_cache.shape)

        except Exception as e:
            print("ERROR loading data:", str(e))
            raise e

    return _df_cache
