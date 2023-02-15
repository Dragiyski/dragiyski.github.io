export async function loadTextFile(url) {
    return (await fetch(url)).text();
}
