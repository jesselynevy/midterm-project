tailwind.config = {
    theme:{
        extend:{
            fontFamily:{
                Pixel:["Pixelify Sans", "sans-serif"],
                header: ["header", "sans-serif"],
                body: ["body-text", "sans-serif"],
                subtext: ["subtext", "sans-serif"]
            },
            animation: {
                float: "float 1.5s ease-in-out infinite",
            },
            keyframes: {
                float: {
                    "0%, 100%": {transform: "translateY(0)"},
                    "50%": {transform: "translateY(-10px)"},
                }
            },
        }
    }
}
