const canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

// Obtiene las dimensiones de la pantalla actual
const window_height = window.innerHeight;
const window_width = window.innerWidth;

canvas.height = window_height;
canvas.width = window_width;
canvas.style.background = "#ff8";

class Circle {

    constructor(x, y, radius, color, text, speed) {

        this.posX = x;
        this.posY = y;
        this.radius = radius;

        this.color = color;
        this.originalColor = color;

        this.text = text;

        this.speed = speed;

        this.dx = 1 * this.speed;
        this.dy = 1 * this.speed;

        this.collisionTimer = 0;

    }

    draw(context) {

        context.beginPath();

        context.strokeStyle = this.color;

        context.textAlign = "center";
        context.textBaseline = "middle";
        context.font = "20px Arial";

        context.fillText(this.text, this.posX, this.posY);

        context.lineWidth = 2;

        context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2, false);

        context.stroke();

        context.closePath();

    }

    update(context) {

        // CONTROL DEL FLASH AZUL
        if(this.collisionTimer > 0){

            this.color = "#0000FF";
            this.collisionTimer--;

        }else{

            this.color = this.originalColor;

        }

        this.draw(context);

        // Movimiento X
        this.posX += this.dx;

        if (this.posX + this.radius > window_width || this.posX - this.radius < 0) {

            this.dx = -this.dx;

        }

        // Movimiento Y
        this.posY += this.dy;

        if (this.posY + this.radius > window_height || this.posY - this.radius < 0) {

            this.dy = -this.dy;

        }

    }

    setCollision(){

        this.collisionTimer = 10;

    }

    bounce(){

        this.dx = -this.dx;
        this.dy = -this.dy;

    }

}


// Array de círculos
let circles = [];


// Verificar superposición al generarlos
function isOverlapping(x, y, radius){

    for(let i = 0; i < circles.length; i++){

        let dx = x - circles[i].posX;
        let dy = y - circles[i].posY;

        let distance = Math.sqrt(dx * dx + dy * dy);

        if(distance < radius + circles[i].radius){

            return true;

        }

    }

    return false;

}


// Generar círculos
function generateCircles(n){

    for(let i = 0; i < n; i++){

        let radius = Math.random() * 30 + 20;

        let x;
        let y;

        do{

            x = Math.random() * (window_width - radius * 2) + radius;
            y = Math.random() * (window_height - radius * 2) + radius;

        }while(isOverlapping(x, y, radius));


        let color;

        do{

            color = `#${Math.floor(Math.random()*16777215).toString(16).padStart(6,'0')}`;

        }while(color.toUpperCase() === "#0000FF");


        let speed = Math.random() * 4 + 1;

        let text = `C${i + 1}`;

        circles.push(new Circle(x, y, radius, color, text, speed));

    }

}


// Detectar colisiones
function detectCollisions(){

    for(let i = 0; i < circles.length; i++){

        for(let j = i + 1; j < circles.length; j++){

            let c1 = circles[i];
            let c2 = circles[j];

            let dx = c1.posX - c2.posX;
            let dy = c1.posY - c2.posY;

            let distance = Math.sqrt(dx * dx + dy * dy);

            if(distance < c1.radius + c2.radius && distance > 0){

                // flash azul
                c1.setCollision();
                c2.setCollision();

                // superposición
                let overlap = (c1.radius + c2.radius) - distance;

                let nx = dx / distance;
                let ny = dy / distance;

                c1.posX += nx * overlap / 2;
                c1.posY += ny * overlap / 2;

                c2.posX -= nx * overlap / 2;
                c2.posY -= ny * overlap / 2;

                // rebote
                c1.bounce();
                c2.bounce();

            }

        }

    }

}


// Animación
function animate(){

    ctx.clearRect(0, 0, window_width, window_height);

    detectCollisions();

    circles.forEach(circle => {

        circle.update(ctx);

    });

    requestAnimationFrame(animate);

}


// Inicializar
generateCircles(20);
animate();