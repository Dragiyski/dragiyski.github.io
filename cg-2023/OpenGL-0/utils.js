export async function getShaderCode(relativeURI) {
    const fullURI = (new URL(relativeURI, document.baseURI)).href;
    const response = await fetch(fullURI);
    const text = await response.text();
    return text;
}