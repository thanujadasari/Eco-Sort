export const createThumbnail = (
    base64: string,
    mimeType: string,
    maxWidth: number = 100,
    maxHeight: number = 100
): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = `data:${mimeType};base64,${base64}`;

        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > maxWidth) {
                    height *= maxWidth / width;
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width *= maxHeight / height;
                    height = maxHeight;
                }
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                return reject(new Error('Could not get canvas context'));
            }

            ctx.drawImage(img, 0, 0, width, height);

            // Returns a base64 string without the 'data:image/jpeg;base64,' prefix
            resolve(canvas.toDataURL('image/jpeg', 0.8).split(',')[1]);
        };

        img.onerror = (error) => {
            reject(error);
        };
    });
};
