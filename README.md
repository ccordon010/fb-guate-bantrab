# Guía para Actualizar config.json desde una Petición POST

Esta guía te mostrará paso a paso cómo extraer los valores de una petición POST (curl) de Facebook y actualizar el archivo `config.json`.

## 📋 Tabla de Contenidos

1. [Preparación](#preparación)
2. [Extracción de Valores del Curl](#extracción-de-valores-del-curl)
3. [Actualización del config.json](#actualización-del-configjson)
4. [Verificación](#verificación)

---

## 🔧 Preparación

### Paso 1: Obtener la Petición POST

1. Abre las **Herramientas de Desarrollador** en tu navegador (F12)
2. Ve a la pestaña **Network** (Red)
3. Realiza una acción que genere un comentario en Facebook
4. Busca la petición a `api/graphql/` con el nombre `useCometUFICreateCommentMutation`
5. Haz clic derecho en la petición → **Copy** → **Copy as cURL**

### Paso 2: Preparar el Archivo config.json

Abre el archivo `config.json` en tu editor de texto favorito.

---

## 📥 Extracción de Valores del Curl

### Sección 1: Headers (Encabezados)

#### 1.1 Cookies (`-b` o `--cookie`)

**Ubicación en curl:**
```
-b ^"sb=Nk4SaYK8USW70fWyCKHE__nW; datr=...; ...^"
```

**Qué hacer:**
- Copia **todo el valor** después de `-b ^"` hasta el `^"` final
- **NO incluyas** los caracteres `^"` al inicio y final
- Decodifica los caracteres `^%^` si los hay (en Windows PowerShell, estos son escapes)

**Ejemplo:**
```json
"cookies": "sb=Nk4SaYK8USW70fWyCKHE__nW; datr=Nk4SaQl3ZE7AaSz0AgOS7GeZ; ps_l=1; ps_n=1; c_user=100000029662465; xs=36%3ANcDJXfr7J0ZtpA%3A2%3A1762807372%3A-1%3A-1; fr=0Gj7T3BEERtEfDUnU.AWf4pN3fVw9N_hTbtAakYWtfObCRKhUlV5tAG2DBr_v6s9qRa4I.BpEk42..AAA.0.0.BpEk5S.AWe0loDe8exxKeUiWnfVMJh0U5U; ar_debug=1; presence=C%7B%22t3%22%3A%5B%5D%2C%22utc3%22%3A1762807516451%2C%22v%22%3A1%7D; wd=936x911"
```

**Ubicación en config.json:**
```json
{
  "config": {
    "cookies": "AQUÍ_VA_EL_VALOR"
  }
}
```

#### 1.2 x-fb-lsd (Header)

**Ubicación en curl:**
```
-H ^"x-fb-lsd: 8dP7dkJIXCgX8IH9q4LlSG^"
```

**Qué hacer:**
- Copia el valor después de `x-fb-lsd: ` (sin espacios extras)

**Ejemplo:**
```json
"lsd": "8dP7dkJIXCgX8IH9q4LlSG"
```

**Ubicación en config.json:**
```json
{
  "config": {
    "lsd": "AQUÍ_VA_EL_VALOR"
  }
}
```

---

### Sección 2: Data Raw (Cuerpo de la Petición)

El `--data-raw` contiene todos los parámetros de la petición. Está en formato URL-encoded (`parametro=valor&otro=valor2`).

#### 2.1 Parámetros Principales (config)

##### actor_id

**Ubicación en curl:**
```
--data-raw ^"av=100000029662465^&...
```

**Qué hacer:**
- Busca `av=` en el data-raw
- El valor después de `av=` es el `actor_id`

**Ejemplo:**
```json
"actor_id": "100000029662465"
```

**Ubicación en config.json:**
```json
{
  "config": {
    "actor_id": "AQUÍ_VA_EL_VALOR"
  }
}
```

##### fb_dtsg

**Ubicación en curl:**
```
...^&fb_dtsg=NAftS7AIkBhp2d8zL1jcyUSkFuiFp7BJxkzJ7r3zp-jw4rVn5rQ1lTQ^%^3A36^%^3A1762807372^&...
```

**Qué hacer:**
- Busca `fb_dtsg=` en el data-raw
- Copia el valor completo (puede contener `^%^3A` que es `:` codificado)
- Decodifica: `^%^3A` = `:`

**Ejemplo:**
```json
"fb_dtsg": "NAftS7AIkBhp2d8zL1jcyUSkFuiFp7BJxkzJ7r3zp-jw4rVn5rQ1lTQ:36:1762807372"
```

**Ubicación en config.json:**
```json
{
  "config": {
    "fb_dtsg": "AQUÍ_VA_EL_VALOR"
  }
}
```

##### requestCounter

**Ubicación en curl:**
```
...^&req=73^&...
```

**Qué hacer:**
- Busca `req=` en el data-raw
- El valor es un número (puede incrementarse con cada petición)

**Ejemplo:**
```json
"requestCounter": 73
```

**Nota:** Este valor se incrementa automáticamente después de cada petición, pero puedes establecerlo manualmente.

**Ubicación en config.json:**
```json
{
  "config": {
    "requestCounter": 73
  }
}
```

##### feedback_id

**Ubicación en curl:**
- Está dentro del parámetro `variables` (JSON codificado)
- Busca: `"feedback_id":"ZmVlZGJhY2s6MTI1MDk0OTYwMDQxMTYzMg=="`

**Qué hacer:**
- Necesitas decodificar el parámetro `variables` (ver sección 2.3)
- O busca directamente en el texto codificado: `feedback_id^%^22^%^3A^%^22` seguido del valor

**Ejemplo:**
```json
"feedback_id": "ZmVlZGJhY2s6MTI1MDk0OTYwMDQxMTYzMg=="
```

**Ubicación en config.json:**
```json
{
  "config": {
    "feedback_id": "AQUÍ_VA_EL_VALOR"
  }
}
```

##### commentRanges

**Ubicación en curl:**
- Está dentro del parámetro `variables` en el objeto `message.ranges`

**Qué hacer:**
1. Decodifica el parámetro `variables` (ver sección 2.3)
2. Busca el array `ranges` dentro de `message`
3. Extrae cada objeto con `entity.id`, `length` y `offset`

**Ejemplo del curl decodificado:**
```json
"ranges": [
  {
    "entity": { "id": "100064898101316" },
    "length": 7,
    "offset": 156
  },
  {
    "entity": { "id": "100094740747271" },
    "length": 17,
    "offset": 164
  }
]
```

**Ubicación en config.json:**
```json
{
  "config": {
    "commentRanges": [
      {
        "entity": { "id": "100064898101316" },
        "length": 7,
        "offset": 156
      },
      {
        "entity": { "id": "100094740747271" },
        "length": 17,
        "offset": 164
      }
    ]
  }
}
```

#### 2.2 Parámetros Estáticos (params)

Estos parámetros van en la sección `params` del config.json. Todos están en el `--data-raw`:

| Parámetro en curl | Clave en config.json | Ejemplo |
|-------------------|---------------------|---------|
| `_aaid=0` | `"__aaid": "0"` | `"__aaid": "0"` |
| `a=1` | `"__a": "1"` | `"__a": "1"` |
| `hs=20402.HYP...` | `"__hs": "..."` | `"__hs": "20402.HYP:comet_pkg.2.1...0"` |
| `dpr=1` | `"dpr": "1"` | `"dpr": "1"` |
| `ccg=EXCELLENT` | `"__ccg": "EXCELLENT"` | `"__ccg": "EXCELLENT"` |
| `rev=1029659368` | `"__rev": "..."` | `"__rev": "1029659368"` |
| `s=hf3rwx:lxyoe9:qo7k1j` | `"__s": "..."` | `"__s": "hf3rwx:lxyoe9:qo7k1j"` |
| `hsi=7571200039288781674` | `"__hsi": "..."` | `"__hsi": "7571200039288781674"` |
| `dyn=7xeUjGU5a5Q1...` | `"__dyn": "..."` | `"__dyn": "7xeUjGU5a5Q1ryaxG4Vp41twWwIxu13wFwhUKbgS3q2ibwNw9G2Saw8i2S1DwUx60GE5O0BU2_CxS320qa321Rwwwqo462mcwfG12wOx62G5Usw9m1YwBgK7o6C1uwoE4G17yovwRwlE-U2exi4UaEW2G1jwUBwJK14xm3y11xfxmu3W3rwxwjFovUaU6a0BEbUG2-azqwaW223908O3216xi4UK2K2WEjxK2B08-269wkopg4-6o4e4UO2m3Gfw-KufxamEbbxG1fBG2-2K0E8461wweW2K3abxG6E"` |
| `csr=gesfgz3QahcaNc9...` | `"__csr": "..."` | `"__csr": "gesfgz3QahcaNc9igX6MR7E9h4Ar4gMwwyl9kmz9ivRsydrpdr_lttgwBJV5AcGfagyhZOajZ8y8nXbtfOuTFydbCFLRZKyV4HEyjtk-XChqKClauRmRhQa9XlF2ahAhBXKCJAAWiGh7CAKiRBKlkHyVGyF8yQBjCKa8h4B_ARVDaAu-AGU_iA_LWBiGiayeLpel2ryQQBhvDx6mUGQAVKnGqEGEiA-uuKi9KpzmEDp94y4zaAx2GhbJ5viDF3AGz5UB29pUG4AbK8zqCyFFVkULCUV5CAxymqEPzVXBy8S68B3F8N6BiyUqxB0zLyQ4-AUO48HyAcDjKFWB-8yojUOmQ9y426l5y8S5qy8yWUgAyo8Upx-eCyrCUgmq8xq9xq5UbK32eCBzbG10xW8xCbzEiDxmm5qV9888W49FFuUCdDyEcWxKidwTBxy2ecwEwCz4awOxGC6Uizo7W1TxybK4EG5U4e8wHzUFCwJAz9aC8EbE4Dxq3K1Bxa2W5U9pobF8do66U-1WxG3maDxudx2i2WEnBCCDzU849wnQ0BUjwaifGewSwSxC0gm2y055e2W2-E0hzw1oJ02lS5U0Cuuu06mkcUx02mQm04V8do1C82eBg23xmu0iDgow08_G2q01bSwjE4i1yy8B075wcBwhXwwgy0Ydwqofo1mUeU16P03fUB1KU1xU8Ejw8-bAw10dwqU0FaWxla5t04rwgU5u8wLw7Zwe101vy2q58lgow5Uw9O0ciw2iU10E2G80UU1lo08s819k0aiK0tMw0JcMgwJwgU4Ofycw6u08axu06cE2rw3ao0-aaz81qUAw0xq0sO0asyy09B0GgiU0Gq1UwgUfU49o0JW9wl8"` |
| `hsdp=g5QwgjNq54eMUwp...` | `"hsdp": "..."` | `"hsdp": "g5QwgjNq54eMUwpEh5GgfI64HfTkh3IXsx2NPYgxiaPjA-OWv22tTasgD2vaaVwR2cGb11TMGhC24fl5NI9Nco_97rsY_7EJ2yGwDii8W996hytPR7ACeGKP5C6hcnGwyt8y789Uwy4W48V6UEml4ax3MD6NBsD9V1sfmO4oIlb5gN4h0NEiziTfcqNH8x2d8yJEF2kSyz4bhq829aagSp2yDiijgNaP2pEWU846AQ48UFoqmkMcC59zC8cjKA5G8ahy1ngJ3VA9m5Q9J2Ombzka89Gjeqdli6yAjgN4wOaaINUx7oZ1oMsxkzgnxRe7yyVk6UgEAwsglKn9ByUC3e9x2kJ39En88Dx23KQAyBx62hIN4qiN1UlgpVE5W5rai7EK4qHKuWBUx6AU947WyQuiCq2CES8Khxsw-9xmdoybgCiFWDGvmdg411ydK6oN7grx92Acy8WK2aaBzeFeaDgsRxh5zpE8pUy1fwJyUizAZ6BCzoBa4e58gCSeyV9AmdHJAAaF8yXGWOkh2k8yV9BACidjCCJ6B_gUnh8e8yiUSU4KmqcxW3XwPx-7E8KfwF-XgS8z9kexOdxLG6oC4Cl38hxqF-YB9Va9CzEvz8vByUC9J6g9E-im8heQBQ9y8hWkDlqxi3p90nVEkG6UmKi3Oi6EK4Foa-lxi4UKq64H8i-2WewMzoO3C1uwp8iBzEy9w8W3OinUjK8yEOdo6e3eeUSfyoGES58sGGh49Gpp6oyiCCHqF5FxC1hwpFUlxW5EgwNwDxi2e12xO6oqDwwKp4aCXiVUFJ5_gJ6XoLzuimu0i21AwLxO04bXwMUqwcW3q0FE9Emw9u4E5m1xwYx60cfwpEiwdJ0au0iOeAwiU12U16oiw22E4S1WwgU9o28w4Bxq1Ixa0KU4y2W7o2zwa60IEpwFzo3Bw7aw6cwh824wwwrE1n988U36wPG0yE5a320E81oU18U"` |
| `hblp=1a543245IkHh86u8...` | `"hblp": "..."` | `"hblp": "1a543245IkHh86u8wnUKfz6dweui2u4oB3eey8nxK0hefwICwZxi2K5E56i6ryEjz8jwNwfC9xu8x2m6A3a1jxq0wEb89KFQayoOi2mfG68O8yolx648eoC6UC7Euxe3iqbxW7Uuxa585FeaCwIwh89E6-688UcEapE4qm1Awh8hDwGx6Ey2O12Dz9UhwHy-8yk6EkxG68O4p8-6WzE6x5Bz89ojxW2u522F8bEnG0IA1-wxzEeEgwPUWdwQAxy9zEpwSAwaa7E2TAzE5e2e3222cwVpo24xicwJw8W9w4lwmE5C3m2y3q48gAwjo4617w4RzU6y8wBxq2e2G3SE9omG582cxu2u1TwFwHwkFEnwgpe19xybwcC4EfU8ErK0x82mwAy8lwbu19xu3a0CUdo4i7Fo27wu9o9E885C0Co22wg82swCwKwmEcXwlo66cwgoaS2a0MUcU6u0AEbE2sw4owgo6bwwxS486e0JUWi1bwkE2Uzo10Ey4E6OFEpw5JyU4SaK1HwgU9o28w4axG5EfUhxG4E7e17wgpEbEtwQwrE2xwoXwiEpAwAzo5K2y1ww3lU4a0IEO7EO1gxKE662m0zV88VofoaE5iEcWw8G4byES2i32q3K782EUO0yk2Wq297w9m16wVz8KcGcw"` |
| `sjsp=g5QwgjNq54eMUwp...` | `"sjsp": "..."` | `"sjsp": "g5QwgjNq54eMUwpEh5GgfI64HfTkh3IXsx2NPYgxiaPjA-OWv22tTasSD2vaaVwwx4ldayMgtYaApwx3Rhsr25hc-rSxSTffN4O8Aa8W5qbjEzEzkp69TeIubedJ5CtOm4Wx57jg9u8GHaggyCBz8Slx6kUlgPOofFQ68K74UGcq4yTo99EyoyB8UylUAES5i0zG212yDijwoQ6AQ0xUa234agmJ0KgbUpgboR2y2qwxh2154Qch8cA2y6k1lgnxRe7O2Vk6UgDxZ1mc-m1jx2q35wyw9x18weuq1uxDo8U8UhGmagS2h0KzqpEaotAxC4EC2fx-idDGvm1fgozrwLgbEOcy8WK2a48PGqaDgdUqwxw8WbwSCxt1m326F8rGnxmcK44h1-ivACgGUpwrUqwko77wkU47whoW8wjo2mz8W5U5Km1KwEwhU3JwhofFobpu2y0OU1NUf98dorwaC2u0h-1CDwn85C5823xC6EabCh2FKQKuarhvQbhKS0l6"` |
| `comet_req=15` | `"__comet_req": "15"` | `"__comet_req": "15"` |
| `jazoest=25572` | `"jazoest": "25572"` | `"jazoest": "25572"` |
| `spin_r=1029659368` | `"__spin_r": "..."` | `"__spin_r": "1029659368"` |
| `spin_b=trunk` | `"__spin_b": "trunk"` | `"__spin_b": "trunk"` |
| `crn=comet.fbweb...` | `"__crn": "..."` | `"__crn": "comet.fbweb.CometProfileTimelineListViewRoute"` |
| `fb_api_caller_class=RelayModern` | `"fb_api_caller_class": "RelayModern"` | `"fb_api_caller_class": "RelayModern"` |
| `fb_api_req_friendly_name=useCometUFICreateCommentMutation` | `"fb_api_req_friendly_name": "useCometUFICreateCommentMutation"` | `"fb_api_req_friendly_name": "useCometUFICreateCommentMutation"` |
| `server_timestamps=true` | `"server_timestamps": "true"` | `"server_timestamps": "true"` |
| `doc_id=25082280574724522` | `"doc_id": "25082280574724522"` | `"doc_id": "25082280574724522"` |

**Nota:** Los parámetros `spin_t` y `req` son dinámicos y se generan en tiempo de ejecución, no necesitas copiarlos.

**Ubicación en config.json:**
```json
{
  "params": {
    "__aaid": "0",
    "__a": "1",
    "__hs": "...",
    "dpr": "1",
    "__ccg": "EXCELLENT",
    "__rev": "...",
    "__s": "...",
    "__hsi": "...",
    "__dyn": "...",
    "__csr": "...",
    "hsdp": "...",
    "hblp": "...",
    "sjsp": "...",
    "__comet_req": "15",
    "jazoest": "...",
    "__spin_r": "...",
    "__spin_b": "trunk",
    "__crn": "...",
    "fb_api_caller_class": "RelayModern",
    "fb_api_req_friendly_name": "useCometUFICreateCommentMutation",
    "server_timestamps": "true",
    "doc_id": "25082280574724522"
  }
}
```

#### 2.3 Decodificar el Parámetro `variables`

El parámetro `variables` contiene un JSON codificado en URL. Necesitas decodificarlo para extraer algunos valores.

**Ubicación en curl:**
```
...^&variables=^%^7B^%^22feedLocation^%^22^%^3A^%^22TIMELINE^%^22^%^2C...
```

**Cómo decodificarlo:**

1. **Método Manual (Online):**
   - Copia el valor después de `variables=`
   - Ve a https://www.urldecoder.org/
   - Pega el valor y decodifica
   - El resultado será un JSON

2. **Método con JavaScript (Node.js):**
   ```javascript
   const encoded = "%7B%22feedLocation%22%3A%22TIMELINE%22...";
   const decoded = decodeURIComponent(encoded);
   console.log(decoded);
   ```

3. **Valores importantes dentro de `variables`:**
   - `feedback_id`: `"ZmVlZGJhY2s6MTI1MDk0OTYwMDQxMTYzMg=="`
   - `message.text`: El texto del comentario
   - `message.ranges`: Array con los `commentRanges`
   - `feedback_referrer`: Ruta de referencia

**Ejemplo decodificado:**
```json
{
  "feedLocation": "TIMELINE",
  "feedbackSource": 0,
  "groupID": null,
  "input": {
    "client_mutation_id": "5",
    "actor_id": "100000029662465",
    "attachments": null,
    "feedback_id": "ZmVlZGJhY2s6MTI1MDk0OTYwMDQxMTYzMg==",
    "formatting_style": null,
    "message": {
      "ranges": [
        {
          "entity": { "id": "100064898101316" },
          "length": 7,
          "offset": 156
        },
        {
          "entity": { "id": "100094740747271" },
          "length": 17,
          "offset": 164
        }
      ],
      "text": "Hoy y siempre, solo con la nuestra, nuestra bicolor, la esperanza nunca muere, y estamos llenos de ilusión por ver a nuestra selección triunfar #VamosGuate Bantrab Deportes Bantrab "
    },
    "feedback_referrer": "/two_step_verification/authentication/",
    "feedback_source": "PROFILE"
  }
}
```

#### 2.4 textoBase

**Ubicación:**
- Dentro del parámetro `variables` decodificado, en `input.message.text`

**Qué hacer:**
- Extrae el texto del comentario (sin los emojis y números de intento que se agregan automáticamente)
- Este será tu `textoBase`

**Ejemplo:**
```json
"textoBase": "Hoy y siempre, solo con la nuestra, nuestra bicolor, la esperanza nunca muere, y estamos llenos de ilusión por ver a nuestra selección triunfar #VamosGuate Bantrab Deportes Bantrab"
```

**Ubicación en config.json:**
```json
{
  "textoBase": "AQUÍ_VA_EL_TEXTO_BASE_DEL_COMENTARIO"
}
```

---

## ✏️ Actualización del config.json

### Estructura Completa del Archivo

```json
{
  "config": {
    "cookies": "VALOR_DEL_HEADER_-b",
    "fb_dtsg": "VALOR_DEL_DATA_RAW_fb_dtsg",
    "lsd": "VALOR_DEL_HEADER_x-fb-lsd",
    "feedback_id": "VALOR_DEL_VARIABLES_DECODIFICADO",
    "actor_id": "VALOR_DEL_DATA_RAW_av",
    "requestCounter": NUMERO_DEL_DATA_RAW_req,
    "commentRanges": [
      {
        "entity": { "id": "ID_DEL_VARIABLES" },
        "length": NUMERO_DEL_VARIABLES,
        "offset": NUMERO_DEL_VARIABLES
      }
    ]
  },
  "params": {
    "__aaid": "VALOR_DEL_DATA_RAW__aaid",
    "__a": "VALOR_DEL_DATA_RAW_a",
    "__hs": "VALOR_DEL_DATA_RAW_hs",
    "dpr": "VALOR_DEL_DATA_RAW_dpr",
    "__ccg": "VALOR_DEL_DATA_RAW_ccg",
    "__rev": "VALOR_DEL_DATA_RAW_rev",
    "__s": "VALOR_DEL_DATA_RAW_s",
    "__hsi": "VALOR_DEL_DATA_RAW_hsi",
    "__dyn": "VALOR_DEL_DATA_RAW_dyn",
    "__csr": "VALOR_DEL_DATA_RAW_csr",
    "hsdp": "VALOR_DEL_DATA_RAW_hsdp",
    "hblp": "VALOR_DEL_DATA_RAW_hblp",
    "sjsp": "VALOR_DEL_DATA_RAW_sjsp",
    "__comet_req": "VALOR_DEL_DATA_RAW_comet_req",
    "jazoest": "VALOR_DEL_DATA_RAW_jazoest",
    "__spin_r": "VALOR_DEL_DATA_RAW_spin_r",
    "__spin_b": "VALOR_DEL_DATA_RAW_spin_b",
    "__crn": "VALOR_DEL_DATA_RAW_crn",
    "fb_api_caller_class": "VALOR_DEL_DATA_RAW_fb_api_caller_class",
    "fb_api_req_friendly_name": "VALOR_DEL_DATA_RAW_fb_api_req_friendly_name",
    "server_timestamps": "VALOR_DEL_DATA_RAW_server_timestamps",
    "doc_id": "VALOR_DEL_DATA_RAW_doc_id"
  },
  "textoBase": "TEXTO_EXTRAIDO_DEL_VARIABLES_MESSAGE_TEXT"
}
```

### Checklist de Actualización

- [ ] **Cookies** (`config.cookies`) - Del header `-b`
- [ ] **fb_dtsg** (`config.fb_dtsg`) - Del data-raw `fb_dtsg=`
- [ ] **lsd** (`config.lsd`) - Del header `x-fb-lsd:`
- [ ] **feedback_id** (`config.feedback_id`) - Del `variables` decodificado
- [ ] **actor_id** (`config.actor_id`) - Del data-raw `av=`
- [ ] **requestCounter** (`config.requestCounter`) - Del data-raw `req=`
- [ ] **commentRanges** (`config.commentRanges`) - Del `variables.message.ranges`
- [ ] **Todos los params** - Del data-raw (ver tabla de mapeo)
- [ ] **textoBase** - Del `variables.message.text`

---

## ✅ Verificación

### 1. Validar JSON

Asegúrate de que el archivo `config.json` sea válido:

- Usa un validador JSON online: https://jsonlint.com/
- O en la terminal: `node -e "JSON.parse(require('fs').readFileSync('config.json', 'utf8'))"`

### 2. Probar la Configuración

Ejecuta el script:

```bash
node index.js
```

### 3. Verificar Logs

Revisa la carpeta `logs/` para ver las respuestas de las peticiones.

---

## 🔍 Consejos y Trucos

### Decodificación Rápida de Variables

Si tienes Node.js instalado, puedes usar este script temporal:

```javascript
// decode-variables.js
const encoded = "TU_VARIABLE_CODIFICADA_AQUI";
console.log(decodeURIComponent(encoded));
```

Ejecuta: `node decode-variables.js`

### Caracteres Especiales en Windows PowerShell

En PowerShell, los caracteres `^` son escapes. Al copiar del curl:
- `^"` = `"`
- `^%^` = `%`
- `^&` = `&`

### Valores que Cambian Frecuentemente

Estos valores pueden cambiar con cada sesión o petición:
- `cookies` - Se actualiza con cada sesión
- `fb_dtsg` - Token de seguridad
- `lsd` - Token de sesión
- `__dyn`, `__csr`, `hsdp`, `hblp`, `sjsp` - Valores dinámicos de Facebook
- `__rev`, `__s`, `__hsi` - Versiones y hashes

### Valores que Raramente Cambian

Estos valores suelen mantenerse:
- `actor_id` - Tu ID de usuario
- `feedback_id` - ID del post donde comentas
- `commentRanges` - Posiciones de los tags (pueden cambiar si cambias el texto)
- `doc_id` - ID del documento GraphQL
- `textoBase` - Tu texto base (puedes modificarlo)

---

## 📝 Ejemplo Completo

Aquí tienes un ejemplo de cómo se vería un `config.json` actualizado:

```json
{
  "config": {
    "cookies": "sb=Nk4SaYK8USW70fWyCKHE__nW; datr=Nk4SaQl3ZE7AaSz0AgOS7GeZ; ps_l=1; ps_n=1; c_user=100000029662465; xs=36%3ANcDJXfr7J0ZtpA%3A2%3A1762807372%3A-1%3A-1; fr=0Gj7T3BEERtEfDUnU.AWf4pN3fVw9N_hTbtAakYWtfObCRKhUlV5tAG2DBr_v6s9qRa4I.BpEk42..AAA.0.0.BpEk5S.AWe0loDe8exxKeUiWnfVMJh0U5U; ar_debug=1; presence=C%7B%22t3%22%3A%5B%5D%2C%22utc3%22%3A1762807516451%2C%22v%22%3A1%7D; wd=936x911",
    "fb_dtsg": "NAftS7AIkBhp2d8zL1jcyUSkFuiFp7BJxkzJ7r3zp-jw4rVn5rQ1lTQ:36:1762807372",
    "lsd": "8dP7dkJIXCgX8IH9q4LlSG",
    "feedback_id": "ZmVlZGJhY2s6MTI1MDk0OTYwMDQxMTYzMg==",
    "actor_id": "100000029662465",
    "requestCounter": 73,
    "commentRanges": [
      {
        "entity": { "id": "100064898101316" },
        "length": 7,
        "offset": 156
      },
      {
        "entity": { "id": "100094740747271" },
        "length": 17,
        "offset": 164
      }
    ]
  },
  "params": {
    "__aaid": "0",
    "__a": "1",
    "__hs": "20402.HYP:comet_pkg.2.1...0",
    "dpr": "1",
    "__ccg": "EXCELLENT",
    "__rev": "1029659368",
    "__s": "hf3rwx:lxyoe9:qo7k1j",
    "__hsi": "7571200039288781674",
    "__dyn": "7xeUjGU5a5Q1ryaxG4Vp41twWwIxu13wFwhUKbgS3q2ibwNw9G2Saw8i2S1DwUx60GE5O0BU2_CxS320qa321Rwwwqo462mcwfG12wOx62G5Usw9m1YwBgK7o6C1uwoE4G17yovwRwlE-U2exi4UaEW2G1jwUBwJK14xm3y11xfxmu3W3rwxwjFovUaU6a0BEbUG2-azqwaW223908O3216xi4UK2K2WEjxK2B08-269wkopg4-6o4e4UO2m3Gfw-KufxamEbbxG1fBG2-2K0E8461wweW2K3abxG6E",
    "__csr": "gesfgz3QahcaNc9igX6MR7E9h4Ar4gMwwyl9kmz9ivRsydrpdr_lttgwBJV5AcGfagyhZOajZ8y8nXbtfOuTFydbCFLRZKyV4HEyjtk-XChqKClauRmRhQa9XlF2ahAhBXKCJAAWiGh7CAKiRBKlkHyVGyF8yQBjCKa8h4B_ARVDaAu-AGU_iA_LWBiGiayeLpel2ryQQBhvDx6mUGQAVKnGqEGEiA-uuKi9KpzmEDp94y4zaAx2GhbJ5viDF3AGz5UB29pUG4AbK8zqCyFFVkULCUV5CAxymqEPzVXBy8S68B3F8N6BiyUqxB0zLyQ4-AUO48HyAcDjKFWB-8yojUOmQ9y426l5y8S5qy8yWUgAyo8Upx-eCyrCUgmq8xq9xq5UbK32eCBzbG10xW8xCbzEiDxmm5qV9888W49FFuUCdDyEcWxKidwTBxy2ecwEwCz4awOxGC6Uizo7W1TxybK4EG5U4e8wHzUFCwJAz9aC8EbE4Dxq3K1Bxa2W5U9pobF8do66U-1WxG3maDxudx2i2WEnBCCDzU849wnQ0BUjwaifGewSwSxC0gm2y055e2W2-E0hzw1oJ02lS5U0Cuuu06mkcUx02mQm04V8do1C82eBg23xmu0iDgow08_G2q01bSwjE4i1yy8B075wcBwhXwwgy0Ydwqofo1mUeU16P03fUB1KU1xU8Ejw8-bAw10dwqU0FaWxla5t04rwgU5u8wLw7Zwe101vy2q58lgow5Uw9O0ciw2iU10E2G80UU1lo08s819k0aiK0tMw0JcMgwJwgU4Ofycw6u08axu06cE2rw3ao0-aaz81qUAw0xq0sO0asyy09B0GgiU0Gq1UwgUfU49o0JW9wl8",
    "hsdp": "g5QwgjNq54eMUwpEh5GgfI64HfTkh3IXsx2NPYgxiaPjA-OWv22tTasgD2vaaVwR2cGb11TMGhC24fl5NI9Nco_97rsY_7EJ2yGwDii8W996hytPR7ACeGKP5C6hcnGwyt8y789Uwy4W48V6UEml4ax3MD6NBsD9V1sfmO4oIlb5gN4h0NEiziTfcqNH8x2d8yJEF2kSyz4bhq829aagSp2yDiijgNaP2pEWU846AQ48UFoqmkMcC59zC8cjKA5G8ahy1ngJ3VA9m5Q9J2Ombzka89Gjeqdli6yAjgN4wOaaINUx7oZ1oMsxkzgnxRe7yyVk6UgEAwsglKn9ByUC3e9x2kJ39En88Dx23KQAyBx62hIN4qiN1UlgpVE5W5rai7EK4qHKuWBUx6AU947WyQuiCq2CES8Khxsw-9xmdoybgCiFWDGvmdg411ydK6oN7grx92Acy8WK2aaBzeFeaDgsRxh5zpE8pUy1fwJyUizAZ6BCzoBa4e58gCSeyV9AmdHJAAaF8yXGWOkh2k8yV9BACidjCCJ6B_gUnh8e8yiUSU4KmqcxW3XwPx-7E8KfwF-XgS8z9kexOdxLG6oC4Cl38hxqF-YB9Va9CzEvz8vByUC9J6g9E-im8heQBQ9y8hWkDlqxi3p90nVEkG6UmKi3Oi6EK4Foa-lxi4UKq64H8i-2WewMzoO3C1uwp8iBzEy9w8W3OinUjK8yEOdo6e3eeUSfyoGES58sGGh49Gpp6oyiCCHqF5FxC1hwpFUlxW5EgwNwDxi2e12xO6oqDwwKp4aCXiVUFJ5_gJ6XoLzuimu0i21AwLxO04bXwMUqwcW3q0FE9Emw9u4E5m1xwYx60cfwpEiwdJ0au0iOeAwiU12U16oiw22E4S1WwgU9o28w4Bxq1Ixa0KU4y2W7o2zwa60IEpwFzo3Bw7aw6cwh824wwwrE1n988U36wPG0yE5a320E81oU18U",
    "hblp": "1a543245IkHh86u8wnUKfz6dweui2u4oB3eey8nxK0hefwICwZxi2K5E56i6ryEjz8jwNwfC9xu8x2m6A3a1jxq0wEb89KFQayoOi2mfG68O8yolx648eoC6UC7Euxe3iqbxW7Uuxa585FeaCwIwh89E6-688UcEapE4qm1Awh8hDwGx6Ey2O12Dz9UhwHy-8yk6EkxG68O4p8-6WzE6x5Bz89ojxW2u522F8bEnG0IA1-wxzEeEgwPUWdwQAxy9zEpwSAwaa7E2TAzE5e2e3222cwVpo24xicwJw8W9w4lwmE5C3m2y3q48gAwjo4617w4RzU6y8wBxq2e2G3SE9omG582cxu2u1TwFwHwkFEnwgpe19xybwcC4EfU8ErK0x82mwAy8lwbu19xu3a0CUdo4i7Fo27wu9o9E885C0Co22wg82swCwKwmEcXwlo66cwgoaS2a0MUcU6u0AEbE2sw4owgo6bwwxS486e0JUWi1bwkE2Uzo10Ey4E6OFEpw5JyU4SaK1HwgU9o28w4axG5EfUhxG4E7e17wgpEbEtwQwrE2xwoXwiEpAwAzo5K2y1ww3lU4a0IEO7EO1gxKE662m0zV88VofoaE5iEcWw8G4byES2i32q3K782EUO0yk2Wq297w9m16wVz8KcGcw",
    "sjsp": "g5QwgjNq54eMUwpEh5GgfI64HfTkh3IXsx2NPYgxiaPjA-OWv22tTasSD2vaaVwwx4ldayMgtYaApwx3Rhsr25hc-rSxSTffN4O8Aa8W5qbjEzEzkp69TeIubedJ5CtOm4Wx57jg9u8GHaggyCBz8Slx6kUlgPOofFQ68K74UGcq4yTo99EyoyB8UylUAES5i0zG212yDijwoQ6AQ0xUa234agmJ0KgbUpgboR2y2qwxh2154Qch8cA2y6k1lgnxRe7O2Vk6UgDxZ1mc-m1jx2q35wyw9x18weuq1uxDo8U8UhGmagS2h0KzqpEaotAxC4EC2fx-idDGvm1fgozrwLgbEOcy8WK2a48PGqaDgdUqwxw8WbwSCxt1m326F8rGnxmcK44h1-ivACgGUpwrUqwko77wkU47whoW8wjo2mz8W5U5Km1KwEwhU3JwhofFobpu2y0OU1NUf98dorwaC2u0h-1CDwn85C5823xC6EabCh2FKQKuarhvQbhKS0l6",
    "__comet_req": "15",
    "jazoest": "25572",
    "__spin_r": "1029659368",
    "__spin_b": "trunk",
    "__crn": "comet.fbweb.CometProfileTimelineListViewRoute",
    "fb_api_caller_class": "RelayModern",
    "fb_api_req_friendly_name": "useCometUFICreateCommentMutation",
    "server_timestamps": "true",
    "doc_id": "25082280574724522"
  },
  "textoBase": "Hoy y siempre, solo con la nuestra, nuestra bicolor, la esperanza nunca muere, y estamos llenos de ilusión por ver a nuestra selección triunfar #VamosGuate Bantrab Deportes Bantrab"
}
```

---

## 🆘 Solución de Problemas

### Error: "Invalid JSON"
- Verifica que todas las comillas estén correctamente escapadas
- Asegúrate de que no haya comas finales en arrays u objetos
- Usa un validador JSON

### Error: "Cannot read property 'config'"
- Verifica que el archivo `config.json` exista en la raíz del proyecto
- Verifica que la estructura JSON sea correcta

### Los comentarios no se crean
- Verifica que las cookies no hayan expirado
- Actualiza `fb_dtsg` y `lsd`
- Verifica que `feedback_id` sea correcto

---

## 📚 Recursos Adicionales

- [JSON Validator](https://jsonlint.com/)
- [URL Decoder](https://www.urldecoder.org/)
- [JSON Formatter](https://jsonformatter.org/)

---

**Última actualización:** 2024

