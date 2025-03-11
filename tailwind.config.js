tailwind.config = {
    theme:{
        extend:{
            fontFamily:{
                Pixel:["Pixelify Sans", "sans-serif"]
            },
            animation: {
                float: "float 1.5s ease-in-out infinite",
                walk: "walk 0.5s steps(2) infinite",
            },
            keyframes: {
                float: {
                    "0%, 100%": {transform: "translateY(0)"},
                    "50%": {transform: "translateY(-10px)"},
                },
                walk: {
                    "0%, 100%": { transform: "translateX(0)" },
                    "50%": { transform: "translateX(2px)" } 
                }
            }
        }
    }
}