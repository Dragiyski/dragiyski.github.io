export async function loadTextFile(url) {
    const response = await fetch(url);
    return response.text();
}
