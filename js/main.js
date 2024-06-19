class Game {
    constructor() {
        this.canvas = document.querySelector("canvas");
        this.context = this.canvas.getContext("2d");

        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        this.mouseX = this.mouseY = 0;
        this.balls = [];
        this.particles = [];

        this.score = 0;
        this.isGameActive = true;
        this.ballSpeed = 10;
        this.slowMotion = false;

        this.slowMotionSpeed = 4;

        this.globalSpeed = 10;

        this.barWidth = 200; 
        this.barHeight = 20; 
        this.barX = (this.canvas.width - this.barWidth) / 2;
        this.barY = this.canvas.height - 40;

        this.intervalId = setInterval(() => {
            if (this.isGameActive) {
                this.generator();
                this.update();
            }
        }, 1000 / 45);

        window.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });

        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });

        window.addEventListener('keydown', (e) => {
            if (e.key === 'r' || e.key === 'R') {
                this.resetGame();
            }
            if (e.key === "s" && this.slowMotion || e.key === "S" && this.slowMotion) {
                this.ballSpeed = this.slowMotionSpeed;
                alert("slowed");
                setInterval(() => {
                    this.ballSpeed = this.globalSpeed;
                    this.slowMotion = false;
                }, 5000);
            }
        });

        this.resizeCanvas();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        
        this.barX = (this.canvas.width - this.barWidth) / 2;
        this.barY = this.canvas.height - 40;
    }

    generator() {
        const randomNum = Math.floor(Math.random() * 10) + 1;
        if (randomNum === 10) {
            const x = Math.floor(Math.random() * this.canvas.width);
            const y = Math.floor(this.canvas.height);
            const size = Math.floor((Math.random() * 10) + 65);
            const type = Math.random() < 0.5;
            const color = "#1B1E26";
            const strokeColor = type ? "#4EBCD4" : "#D4175B";
            const speedX = (Math.random() - 0.5) * this.ballSpeed / 5;
            const speedY = Math.random() * this.ballSpeed / 2 + this.ballSpeed / 2; 

            const ball = {
                x,
                y,
                size,
                type,
                color,
                strokeColor,
                speedX,
                speedY
            };

            this.balls.push(ball);
        }
    }

    createParticles(x, y, color) {
        for (let i = 0; i < 10; i++) {
            const particle = {
                x,
                y,
                color,
                size: Math.random() * 6 + 3,
                speedX: Math.random() * 3 - 1.5,
                speedY: Math.random() * 3 - 1.5,
                opacity: 1,
                life: 60
            };
            this.particles.push(particle);
        }
    }

    update() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.balls.forEach((ball, index) => {
            ball.x += ball.speedX;
            ball.y -= ball.speedY;
            ball.speedY -= 0.1;

            this.context.fillStyle = ball.color;
            this.context.strokeStyle = ball.strokeColor;
            this.context.fillRect(ball.x, ball.y, ball.size, ball.size);
            this.context.strokeRect(ball.x, ball.y, ball.size, ball.size);

            const dx = ball.x - this.mouseX;
            const dy = ball.y - this.mouseY;
            const distance = Math.hypot(dx, dy);
            if (distance < ball.size) {
                this.balls.splice(index, 1);
                if (ball.type) {
                    this.score += 1;
                    if (this.score % 10 === 0) {
                        this.ballSpeed += 1;
                        this.createWaveEffect(ball.x + ball.size / 2, ball.y + ball.size / 2);
                        this.slowMotion = true;
                    }
                } else {
                    this.isGameActive = false;
                }
                this.createParticles(ball.x + ball.size / 2, ball.y + ball.size / 2, ball.strokeColor);
            }

            if (ball.y + ball.size < 0 || ball.y > this.canvas.height + 10) {
                this.balls.splice(index, 1);
            }
        });

        this.particles.forEach((particle, index) => {
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            particle.speedX *= 0.99;
            particle.speedY *= 0.99;
            particle.opacity -= 1 / particle.life;

            if (particle.life <= 0) {
                this.particles.splice(index, 1);
            } else {
                this.context.globalAlpha = Math.max(0, particle.opacity);
                this.context.fillStyle = particle.color;
                this.context.fillRect(particle.x, particle.y, particle.size, particle.size);
            }
        });

        this.context.globalAlpha = 1;
        this.drawText();
        this.drawBar();
    }

    drawText() {
        this.context.font = "20px dossis";
        this.context.fillStyle = "white";
        this.context.fillText(`SCORE: ${this.score}`, 20, 40);
        this.context.fillText(`Press R to restart`, 20, this.canvas.height - 20);
        this.context.fillText("Press S to Slow",this.barX + 10,this.barY - 20)
    }

    drawBar() {
        
        this.barFillPercentage = this.slowMotion ? 1 : 0;

        this.context.fillStyle = '#4CAF50';
        this.context.fillRect(this.barX, this.barY, this.barWidth * this.barFillPercentage, this.barHeight);


        this.context.strokeStyle = 'white';
        this.context.lineWidth = 2;
        this.context.strokeRect(this.barX, this.barY, this.barWidth, this.barHeight);
    }

    createWaveEffect(x, y) {
        const colors = ['#4EBCD4', '#D4175B', '#F9DC5C', '#17A589'];
        for (let i = 0; i < 30; i++) {
            const color = colors[Math.floor(Math.random() * colors.length)];
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 5 + 1;
            const particle = {
                x,
                y,
                color,
                size: Math.random() * 6 + 3,
                speedX: Math.cos(angle) * speed,
                speedY: Math.sin(angle) * speed,
                opacity: 1,
                life: 60
            };
            this.particles.push(particle);
        }
    }

    resetGame() {
        this.score = 0;
        this.balls = [];
        this.particles = [];
        this.isGameActive = true;
        this.ballSpeed = 10;
        this.globalSpeed = 10;
        this.slowMotion = false;
    }
}

let game = new Game();
