const script_url = new URL(import.meta.url);

const scene_list = [
    {
        url: new URL('scene/0001-perspective-camera', script_url),
        name: 'Perspective camera',
        description: 'Visualize the ray direction for the perspective camera in [R, G, B] world coordinates.'
    }
];

async function main() {
    document.getElementById('scene-menu').hidden = true;
}

if (document.readyState !== 'complete') {
    window.addEventListener('load', onFirstLoadedEvent);
    document.addEventListener('readystatechange', onDocumentStateChangeEvent);
    window.addEventListener('beforeunload', onFirstUnloadEvent);
    window.addEventListener('pagehide', onFirstUnloadEvent);
} else {
    main();
}

function onDocumentStateChangeEvent() {
    if (document.readyState === 'complete') {
        onFirstLoadedEvent();
    }
}

function onFirstLoadedEvent() {
    window.removeEventListener('load', onFirstLoadedEvent);
    document.removeEventListener('readystatechange', onDocumentStateChangeEvent);
    main().catch(error => {
        console.error(error);
        unload();
    });
}

function onFirstUnloadEvent() {
    window.removeEventListener('beforeunload', onFirstUnloadEvent);
    window.removeEventListener('pagehide', onFirstUnloadEvent);
    unload();
}

function unload() {
    const screen = document.getElementById('screen');
    if (screen.scene != null) {
        screen.release(screen.scene);
    }
}
