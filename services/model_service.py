import joblib
from sklearn.metrics import f1_score, roc_auc_score, roc_curve, confusion_matrix

MODEL_PATH = "models/rf_model.pkl"

_model = None
_feature_names = None


def load_model():
    global _model, _feature_names

    if _model is None:
        print("Loading RandomForest model...")
        _model = joblib.load(MODEL_PATH)

        if not hasattr(_model, "feature_names_in_"):
            raise Exception("Model missing feature_names_in_")

        _feature_names = list(_model.feature_names_in_)

        print("Model loaded with", len(_feature_names), "features")

    return _model, _feature_names


def evaluate_model(df):
    model, feature_names = load_model()

    # validate
    for f in feature_names:
        if f not in df.columns:
            raise Exception(f"Dataset missing feature: {f}")

    if "target" not in df.columns:
        raise Exception("Dataset missing target column")

    X = df[feature_names]
    y = df["target"]

    y_pred = model.predict(X)
    y_prob = model.predict_proba(X)[:, 1]

    f1 = f1_score(y, y_pred)
    roc = roc_auc_score(y, y_prob)

    tn, fp, fn, tp = confusion_matrix(y, y_pred).ravel()

    importances = model.feature_importances_

    feature_importance = sorted([
        {"feature": f, "importance": float(i)}
        for f, i in zip(feature_names, importances)
    ], key=lambda x: x["importance"], reverse=True)

    fpr, tpr, _ = roc_curve(y, y_prob)

    return {
        "f1_score": float(f1),
        "roc_auc": float(roc),
        "confusion_matrix": {
            "tn": int(tn),
            "fp": int(fp),
            "fn": int(fn),
            "tp": int(tp)
        },
        "roc_curve": {
            "fpr": fpr.tolist(),
            "tpr": tpr.tolist()
        },
        "feature_importance": feature_importance
    }