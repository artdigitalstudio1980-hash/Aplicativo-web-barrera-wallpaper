import urllib.request, urllib.error, json, base64, subprocess, sys

TOKEN = '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'
REPO  = 'artdigitalstudio1980-hash/barrera-wallpaper'
KEY_ID = '3380204578043523366'
KEY_B64 = 'UKyLG3vUP+k8c75w0XBRddiCSYi5SJnokE1EFpwFHBY='

try:
    import nacl.public
except ImportError:
    subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'PyNaCl', '-q'])
    import nacl.public

def encrypt(secret, key_b64):
    pub = nacl.public.PublicKey(base64.b64decode(key_b64))
    box = nacl.public.SealedBox(pub)
    return base64.b64encode(box.encrypt(secret.encode())).decode()

pw = '#G$vNW2d6LLw' + chr(33) + 'cq'

secrets = {
    'HOSTINGER_HOST':     '62.72.52.102',
    'HOSTINGER_USERNAME': 'u425976741',
    'HOSTINGER_PASSWORD': pw,
    'HOSTINGER_PORT':     '65002',
    'HOSTINGER_APP_PATH': '/home/u425976741/htdocs/barrerawallpaper.com',
    'NEXTAUTH_URL':       'https://barrerawallpaper.com',
}

headers = {
    'Authorization': 'token ' + TOKEN,
    'Content-Type': 'application/json',
    'User-Agent': 'python'
}

for name, value in secrets.items():
    body = json.dumps({'encrypted_value': encrypt(value, KEY_B64), 'key_id': KEY_ID}).encode()
    url = 'https://api.github.com/repos/' + REPO + '/actions/secrets/' + name
    req = urllib.request.Request(url, data=body, headers=headers, method='PUT')
    try:
        with urllib.request.urlopen(req) as r:
            print('SET (' + str(r.status) + '): ' + name)
    except urllib.error.HTTPError as e:
        print('ERROR ' + str(e.code) + ': ' + name + ' - ' + e.read().decode())
