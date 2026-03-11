const PLACEHOLDER = 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=600&q=80';
const IMAGE_QUERY_MAP = [
    { keys: ['роз', 'роза', 'rose', 'sophia loren', 'nina', 'explorer', 'veggie'], query: 'rose bouquet' },
    { keys: ['пион', 'peony'], query: 'peony bouquet' },
    { keys: ['тюльпан', 'tulip'], query: 'tulip bouquet' },
    { keys: ['альстромер', 'alstroemeria'], query: 'alstroemeria bouquet' },
    { keys: ['хриз', 'хризант', 'chrysanthemum'], query: 'chrysanthemum bouquet' },
    { keys: ['гвоздик', 'carnation'], query: 'carnation bouquet' },
    { keys: ['гортенз', 'hydrangea'], query: 'hydrangea bouquet' },
];
function makeUnsplashUrl(query) {
    const sig = Math.abs([...query].reduce((acc, ch) => acc + ch.charCodeAt(0), 0)) % 9999;
    return `https://source.unsplash.com/600x600/?${encodeURIComponent(query)}&sig=${sig}`;
}
export async function fetchWikimediaImage(query) {
    const term = query.trim().toLowerCase();
    if (!term) {
        return PLACEHOLDER;
    }
    const hit = IMAGE_QUERY_MAP.find((entry) => entry.keys.some((k) => term.includes(k)));
    if (hit) {
        return makeUnsplashUrl(hit.query);
    }
    return PLACEHOLDER;
}
export function getPlaceholderImage() {
    return PLACEHOLDER;
}
