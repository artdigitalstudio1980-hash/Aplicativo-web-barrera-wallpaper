import base64, json, urllib.request
from nacl import encoding, public

TOKEN = "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"
REPO = "artdigitalstudio1980-hash/barrera-wallpaper"

req = urllib.request.Request(
    f"https://api.github.com/repos/{REPO}/actions/secrets/public-key",
    headers={"Authorization": f"token {TOKEN}", "Accept": "application/vnd.github.v3+json"}
)
with urllib.request.urlopen(req) as r:
    key_data = json.load(r)

def encrypt(pub_key_str, secret_value):
    pk = public.PublicKey(pub_key_str.encode("utf-8"), encoding.Base64Encoder())
    box = public.SealedBox(pk)
    return base64.b64encode(box.encrypt(secret_value.encode("utf-8"))).decode("utf-8")

correct_db_url = "mysql://u425976741_wallpaper:Elementos8003*@31.97.208.22:3306/u425976741_barrera"
encrypted = encrypt(key_data["key"], correct_db_url)

data = json.dumps({"encrypted_value": encrypted, "key_id": key_data["key_id"]}).encode()
req = urllib.request.Request(
    f"https://api.github.com/repos/{REPO}/actions/secrets/DATABASE_URL",
    data=data, method="PUT",
    headers={"Authorization": f"token {TOKEN}", "Content-Type": "application/json", "Accept": "application/vnd.github.v3+json"}
)
with urllib.request.urlopen(req) as r:
    print(f"DATABASE_URL updated: {r.status}")
