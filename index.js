const https = require('https');
const { v4: uuidv4 } = require('uuid');
const { fakerES: faker } = require('@faker-js/faker');

// Función para crear comentario
async function createComment(config) {
    const {
        cookies,
        fb_dtsg,
        lsd,
        feedback_id,
        commentText,
        commentRanges,
        actor_id,
        requestCounter = 1
    } = config;

    // Generar UUID único cada vez
    const uniqueUUID = uuidv4();
    const idempotenceToken = `client:${uniqueUUID}`;
    const clientMutationId = Date.now().toString();
    const sessionId = uuidv4(); // También generar uno nuevo para session_id

    // Construir variables
    const variables = {
        feedLocation: "DEDICATED_COMMENTING_SURFACE",
        feedbackSource: 110,
        groupID: null,
        input: {
            client_mutation_id: clientMutationId,
            actor_id: actor_id,
            attachments: null,
            feedback_id: feedback_id,
            formatting_style: null,
            message: {
                text: commentText,
                ranges: commentRanges || []
            },
            reply_target_clicked: false,
            attribution_id_v2: "",
            vod_video_timestamp: null,
            feedback_referrer: "/Bantrab",
            is_tracking_encrypted: true,
            tracking: [],
            feedback_source: "DEDICATED_COMMENTING_SURFACE",
            idempotence_token: idempotenceToken,
            session_id: sessionId
        },
        inviteShortLinkKey: null,
        renderLocation: null,
        scale: 1,
        useDefaultActor: false,
        focusCommentID: null,
        __relay_internal__pv__CometUFICommentAvatarStickerAnimatedImagerelayprovider: false,
        __relay_internal__pv__IsWorkUserrelayprovider: false
    };

    // Construir el body como form-urlencoded
    const params = new URLSearchParams();

    params.append('av', actor_id);
    params.append('__aaid', '0');
    params.append('__user', actor_id);
    params.append('__a', '1');
    params.append('__req', requestCounter.toString());
    params.append('__hs', '20402.HYP:comet_pkg.2.1...0');
    params.append('dpr', '1');
    params.append('__ccg', 'EXCELLENT');
    params.append('__rev', '1029650310');
    params.append('__s', 'y0ysaj:ua7de0:ko27sl');
    params.append('__hsi', '7571162660542596440');
    params.append('__dyn', '7xeUjGU5a5Q1ryaxG4Vp41twWwIxu13wFG14yUJ3odE98K361twYwJyE24wJwpUe8hwaG1sw9u0LVEtwMw6ywIK1Rwwwqo462mcwfG12wOx62G5Usw9m1YwBgK7o6C1uwoE4G17yovwRwlE-U2exi4UaEW2au1jwUBwJK14xm3y11xfxmu3W3y261eBx_wHwfC2-awLyESE2KwwwOg2cwMwhEkxebwHwKG4UrwFg2fwxyo566k1fxC13xecwBwWzUfHDzUiBG2OUqwjVqwLwHwa211wo83KwHwOyUqxG');
    params.append('__csr', 'gen1nbMF1f2dl2Aj4gH7llMRfftYABnfdkAG2Qp9LcAIyZlkIAR9nPaQlpJtCKBjkF-mKiF5OGF98B9R8BrGExQ_TiRnhWSSGHppAdhGARB89iGirCUyiAuDCiZ3azrSFFp4F6gGBV9kVoGFO92XVrx3Fy8iK48KboWdBGyamEymAaHjKS9iypHjCHAiAABGax28gOUhVAnxLKdjyrh4EZebzV8Ll3-F8KmibGbK8gnxa-czXyoK8hF4vGVoqKWDKUO9ByErzEnKaJ3omyEO48B1SuagO2yfDAxO4pp44F9A8yp8kVXUhDxam5ojKdKiU9oO4UOEy4EsAxKi26EswjE9ufwXwJxSFoO2C5ElyU9k2x1G3G1Fz8f8kCwOwYxG8wauawzx6dwGxy1TBKfyoOUdUpwiV8fEOq8wYxO3u3KbgF0MAwLwionwgElwfa3K1SwgE4a1uG2K7Ecotyo4edzEhDrwKK0zWCwGwcWm2q2O2-025abFo08_Q028F1iU0g8Cwb109R00GlwNw4Pw0cxm1Cxi0Gaxl02E9oloog5a0B9S0Ro3Qw8O0gra0dyxG17Ax20SU5-5o9E7aVE0hiy4680Im9ykcDg11o25wTw2Xokw1uC3K3Kpw25E5a0aXw2N82bw65w5ww1_e0oy4U1IEC1yK0dt80IE16o3-c0v-17w1GK1jw3t80Oq1Yo1roC9g1-o0jowhQ2B02mU2vxO0Eo2yiw2vEy');
    params.append('__comet_req', '15');
    params.append('fb_dtsg', fb_dtsg);
    params.append('jazoest', '25319');
    params.append('lsd', lsd);
    params.append('__spin_r', '1029650310');
    params.append('__spin_b', 'trunk');
    params.append('__spin_t', Math.floor(Date.now() / 1000).toString());
    params.append('__crn', 'comet.fbweb.CometProfileTimelineListViewRoute');
    params.append('fb_api_caller_class', 'RelayModern');
    params.append('fb_api_req_friendly_name', 'useCometUFICreateCommentMutation');
    params.append('server_timestamps', 'true');
    params.append('variables', JSON.stringify(variables));
    params.append('doc_id', '25082280574724522');

    const postData = params.toString();

    // Headers
    const options = {
        hostname: 'www.facebook.com',
        path: '/api/graphql/',
        method: 'POST',
        headers: {
            'accept': '*/*',
            'accept-language': 'en-US,en;q=0.9,es-US;q=0.8,es;q=0.7',
            'content-type': 'application/x-www-form-urlencoded',
            'cookie': cookies,
            'origin': 'https://www.facebook.com',
            'referer': 'https://www.facebook.com/Bantrab',
            'sec-ch-ua': '"Google Chrome";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
            'x-asbd-id': '359341',
            'x-fb-friendly-name': 'useCometUFICreateCommentMutation',
            'x-fb-lsd': lsd,
            'content-length': Buffer.byteLength(postData)
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    resolve(response);
                } catch (e) {
                    resolve({ raw: data, error: e.message });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(postData);
        req.end();
    });
}

// Función principal
async function main() {
    // Generar número aleatorio de 6 dígitos para el intento
    const intentoNumero = Math.floor(100000 + Math.random() * 900000);

    // Texto original del comentario + animal + intento
    const textoBase = 'Hoy y siempre, solo con la nuestra. La Selección de Guatemala estara en el mundial! Bantrab Deportes Bantrab.';
    const textoConAnimal = `${textoBase} intento #${intentoNumero} de conseguir entradas. ${faker.internet.emoji({
        types: ['activity']
    })} ${faker.internet.emoji({
        types: ['smiley']
    })} ${faker.internet.emoji({
        types: ['person']
    })}`;

    // CONFIGURACIÓN - Reemplaza con tus valores actuales
    const config = {
        cookies: 'datr=0DfIaG3K21syIwmnR0xolEBb; sb=0TfIaAtCeUWIEUoLPP799FoY; c_user=100001547167044; ps_l=1; ps_n=1; fr=1o4ztqKy6MPK3Pd8I.AWe8g3zC5NsPCLCgLbIOLXZyojjAvSZSuacrT1IltOaBlYndMEs.BpEiof..AAA.0.0.BpEiof.AWeAcBk-4By7OWPWySDwjWD7t6A; xs=13%3AI8GUkCVe6T22hw%3A2%3A1759371011%3A-1%3A-1%3A%3AAcyyy3_A5d5Dre8XFtxKqk7CDpM1A7Ypnv-wW5BnMZE; wd=1536x742; dpr=1.25',
        fb_dtsg: 'NAfurhXZwg2KkULZvK14Z-4SYOTxlgMFC8vFxSV3b19r_0pGjC7V3ZQ:13:1759371011',
        lsd: 'IaEzJcvxhYt85U20ilvL0-',
        feedback_id: 'ZmVlZGJhY2s6MTI1MDk0OTYwMDQxMTYzMg==',
        commentText: textoConAnimal,
        commentRanges: [
            {
                entity: { id: "100064898101316" },
                length: 7,
                offset: 84
            },
            {
                entity: { id: "100094740747271" },
                length: 17,
                offset: 92
            }
        ],
        actor_id: '100001547167044',
        requestCounter: 36 // Incrementa este número cada vez
    };

    try {
        console.log('🚀 Creando comentario...');
        console.log(`🎲 Intento #${intentoNumero}`);
        console.log(`💬 Texto: "${config.commentText}"\n`);

        const response = await createComment(config);

        console.log('✅ Respuesta recibida:\n');
        console.log(JSON.stringify(response, null, 2));

        // Buscar el legacy_fbid en la respuesta
        const responseStr = JSON.stringify(response);
        const fbidMatch = responseStr.match(/"legacy_fbid":\s*"(\d+)"/);
        if (fbidMatch) {
            console.log(`\n🎉 Comentario creado con ID: ${fbidMatch[1]}`);

            // Extraer número total de comentarios del post
            const totalCount = response?.data?.comment_create?.feedback?.comment_rendering_instance?.comments?.total_count;
            if (totalCount !== undefined) {
                console.log(`📊 Total de comentarios en el post: ${totalCount}`);
            } else {
                // Intentar buscar en el string si no está disponible en el objeto
                const countMatch = responseStr.match(/"total_count":\s*(\d+)/);
                if (countMatch) {
                    console.log(`📊 Total de comentarios en el post: ${countMatch[1]}`);
                }
            }
        } else {
            console.log('\n⚠️  No se encontró legacy_fbid en la respuesta');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// Ejecutar
main();