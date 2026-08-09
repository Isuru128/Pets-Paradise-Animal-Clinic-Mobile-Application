const express = require('express');
const router = express.Router();

router.get('/product', async (req, res) => {
    const sourceUrl = String(req.query.url || '').trim();

    try {
        const parsedUrl = new URL(sourceUrl);

        if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
            return res.status(400).json({ msg: 'Only http and https image URLs are supported' });
        }

        const response = await fetch(parsedUrl.toString(), {
            headers: {
                Accept: 'image/*,text/html;q=0.9,*/*;q=0.8',
                'User-Agent': 'PetsParadiseApp/1.0'
            }
        });

        if (!response.ok) {
            return res.status(502).json({ msg: 'Failed to load product image URL' });
        }

        const contentType = response.headers.get('content-type') || '';

        if (contentType.startsWith('image/')) {
            return sendImageResponse(res, response, contentType);
        }

        if (!contentType.includes('text/html')) {
            return res.status(415).json({ msg: 'Product image URL is not an image or web page' });
        }

        const html = await response.text();
        const imageUrl = findPageImageUrl(html, parsedUrl);

        if (!imageUrl) {
            return res.status(404).json({ msg: 'No image found on product page' });
        }

        const imageResponse = await fetch(imageUrl, {
            headers: {
                Accept: 'image/*,*/*',
                'User-Agent': 'PetsParadiseApp/1.0'
            }
        });

        if (!imageResponse.ok) {
            return res.status(502).json({ msg: 'Failed to load resolved product image' });
        }

        const imageContentType = imageResponse.headers.get('content-type') || '';

        if (!isImageResponse(imageContentType, imageUrl)) {
            return res.status(415).json({ msg: 'Resolved URL is not an image' });
        }

        return sendImageResponse(res, imageResponse, getImageContentType(imageContentType, imageUrl));
    } catch (error) {
        res.status(400).json({ msg: 'Invalid product image URL' });
    }
});

async function sendImageResponse(res, response, contentType) {
    const imageBuffer = Buffer.from(await response.arrayBuffer());

    res.set({
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400'
    });

    res.send(imageBuffer);
}

function isImageResponse(contentType, imageUrl) {
    return contentType.startsWith('image/') || Boolean(getImageContentType('', imageUrl));
}

function getImageContentType(contentType, imageUrl) {
    if (contentType.startsWith('image/')) {
        return contentType;
    }

    const pathname = new URL(imageUrl).pathname.toLowerCase();

    if (pathname.endsWith('.jpg') || pathname.endsWith('.jpeg')) {
        return 'image/jpeg';
    }

    if (pathname.endsWith('.png')) {
        return 'image/png';
    }

    if (pathname.endsWith('.webp')) {
        return 'image/webp';
    }

    if (pathname.endsWith('.gif')) {
        return 'image/gif';
    }

    return '';
}

function findPageImageUrl(html, baseUrl) {
    const metaPatterns = [
        /<meta\s+[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i,
        /<meta\s+[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["'][^>]*>/i,
        /<meta\s+[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["'][^>]*>/i,
        /<meta\s+[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:image["'][^>]*>/i
    ];

    for (const pattern of metaPatterns) {
        const match = html.match(pattern);

        if (match?.[1]) {
            return resolveUrl(decodeHtmlEntities(match[1]), baseUrl);
        }
    }

    return findBestImgTagUrl(html, baseUrl);
}

function findBestImgTagUrl(html, baseUrl) {
    const matches = [...html.matchAll(/<img\s+[^>]*>/gi)];
    const candidates = matches
        .map((match) => {
            const tag = match[0];
            const src = readAttribute(tag, 'data-src') || readAttribute(tag, 'src');

            return {
                src,
                score: scoreImageTag(tag)
            };
        })
        .filter((candidate) => candidate.src)
        .sort((first, second) => second.score - first.score);

    return candidates[0] ? resolveUrl(decodeHtmlEntities(candidates[0].src), baseUrl) : '';
}

function readAttribute(tag, name) {
    const match = tag.match(new RegExp(`${name}=["']([^"']+)["']`, 'i'));
    return match?.[1] || '';
}

function scoreImageTag(tag) {
    const lowerTag = tag.toLowerCase();
    let score = 0;

    if (lowerTag.includes('product')) score += 5;
    if (lowerTag.includes('item')) score += 2;
    if (lowerTag.includes('logo')) score -= 5;
    if (lowerTag.includes('icon')) score -= 4;
    if (lowerTag.includes('divider')) score -= 4;
    if (lowerTag.includes('banner')) score -= 2;

    return score;
}

function resolveUrl(value, baseUrl) {
    try {
        return new URL(value, baseUrl).toString();
    } catch (error) {
        return '';
    }
}

function decodeHtmlEntities(value) {
    return value
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
}

module.exports = router;
