export const data = () => {
    const timestamp = Date.now();
    const angle = timestamp * Math.PI / 180;

    return {
        timestamp,
        temperature: Math.sin(angle) * Math.random(),
        pressure: Math.cos(angle) * Math.random(),
    };
}
