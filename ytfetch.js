class YouTubeScraperExtension {
    getInfo() {
        return {
            id: 'ytfetch',
            name: 'YT Fetch',
            blocks: [
                {
                    opcode: 'scrapeYouTube',
                    blockType: Scratch.BlockType.REPORTER,
                    text: 'search YouTube for [QUERY]',
                    arguments: {
                        QUERY: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: 'Scratch programming'
                        }
                    }
                }
            ]
        };
    }

    async scrapeYouTube(args) {
        const query = encodeURIComponent(args.QUERY);
        const url = `https://www.youtube.com/results?search_query=${query}`;

        try {
            const response = await fetch(url, {
                headers: { 'Content-Type': 'text/html' }
            });
            const text = await response.text();

            // Extract the first video URL using regex
            const videoMatch = text.match(/\/watch\?v=([a-zA-Z0-9_-]{11})/);
            if (videoMatch) {
                return `https://www.youtube.com${videoMatch[0]}`;
            } else {
                return 'No results found';
            }
        } catch (error) {
            console.error(error);
            return 'Error fetching data';
        }
    }
}

Scratch.extensions.register(new YouTubeScraperExtension());
