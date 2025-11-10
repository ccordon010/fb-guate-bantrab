const https = require('https');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { fakerES: faker } = require('@faker-js/faker');

// Cargar configuración desde archivo
const configData = JSON.parse(fs.readFileSync('config.json', 'utf8'));

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

    // Parámetros dinámicos
    params.append('av', actor_id);
    params.append('__user', actor_id);
    params.append('__req', requestCounter.toString());
    params.append('__spin_t', Math.floor(Date.now() / 1000).toString());

    // Parámetros estáticos desde config.json
    Object.entries(configData.params).forEach(([key, value]) => {
        params.append(key, value);
    });

    // Parámetros que vienen del config (fb_dtsg y lsd)
    params.append('fb_dtsg', fb_dtsg);
    params.append('lsd', lsd);
    
    // Variables generadas dinámicamente
    params.append('variables', JSON.stringify(variables));

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
    const textoBase = configData.textoBase;
    const textoCompleto = `${textoBase} intento #${intentoNumero} de conseguir entradas. ${faker.internet.emoji({
        types: ['activity']
    })} ${faker.internet.emoji({
        types: ['smiley']
    })} ${faker.internet.emoji({
        types: ['person']
    })}`;

    // CONFIGURACIÓN desde archivo config.json
    const config = {
        ...configData.config,
        commentText: textoCompleto
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