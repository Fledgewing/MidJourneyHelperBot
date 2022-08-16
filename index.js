const discord = require ('discord-interactions');
const nacl = require('tweetnacl');

// Your public key can be found on your application in the Developer Portal
const PUBLIC_KEY = '<PUBLIC KEY GOES HERE>';

module.exports = async function (context, req) {
    const signature = req.get('X-Signature-Ed25519');
    const timestamp = req.get('X-Signature-Timestamp');
    const body = req.rawBody; // rawBody is expected to be a string, not raw bytes

    // Check whether verified
    isVerified = false;
    if(signature != undefined && timestamp != undefined)
    {
        isVerified = nacl.sign.detached.verify(
            Buffer.from(timestamp + body),
            Buffer.from(signature, 'hex'),
            Buffer.from(PUBLIC_KEY, 'hex')
            );
    }

    if (!isVerified) {
        context.res = {
            status: 401
        };
        return;
    }
    
    // Interaction type and data
    const { type, id, data } = req.body;

    /**
     * Handle verification requests
     */
    if (type === discord.InteractionType.PING) {
        context.res = {
            body: {
                type: discord.InteractionResponseType.PONG
            }
        };
        return;
    }

    /*
     * Image Echo requests 
     */
    if (type == discord.InteractionType.APPLICATION_COMMAND)
    {
        var response = "";
        var messages = data.resolved.messages;
        var message = messages[Object.keys(messages)[0]];

        if(message.author.username != "Midjourney Bot")
        {
            response = "Sorry, I only work with Midjourney Bot messages!";
        }
        else
        {
            var str = message.content;
            var sub = str.match(/^\*\*.*\*\*/);
            if (sub) {
                sub = sub[0];
                sub = sub.substr(2);
                sub = sub.substr(0, sub.length - 2)
                message.attachments.forEach(attachment => {
                    var imageLink = attachment.proxy_url;

                    // do things to send message back
                    response += `<${imageLink}> , ${sub}`;
                });
            }
        }

        context.res = {
            headers: {
                "Content-Type": "application/json"
            },
            body: {
                type: discord.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    tts: false,
                    content: response,
                    embeds: [],
                    allowed_mentions: { 
                        parse: []
                    }
                }
            }
        };
        return;
    }

    /*
     * Default
     */
    context.res = {
        // status: 200, /* Defaults to 200 */
        body: responseMessage
    };
}
