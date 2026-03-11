/* =========================================
CONFIGURACIÓN DEL CANVAS
========================================= */

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


/* =========================================
VARIABLES GLOBALES
========================================= */

let objects = [];
let eliminadas = 0;
let regenerationTimer = 0;


/* =========================================
COLORES TROPICALES
========================================= */

const tropicalColors = [
"#ff6b6b",
"#ffa94d",
"#ffd43b",
"#69db7c",
"#38d9a9",
"#4dabf7",
"#9775fa",
"#f06595"
];


/* =========================================
CLASE OBJETO MARINO
========================================= */

class MarineObject{

constructor(x,y,size,type,speed){

this.posX = x;
this.posY = y;

this.size = size;
this.type = type;

this.speed = speed;

// color aleatorio tropical
this.color = tropicalColors[
Math.floor(Math.random()*tropicalColors.length)
];

// movimiento lateral pequeño
this.dx = (Math.random()*2-1) * (this.speed/2);

// caída libre (siempre positiva)
this.dy = this.speed;

}


/* =========================================
DIBUJAR OBJETO
========================================= */

draw(context){

context.save();

context.translate(this.posX,this.posY);
context.fillStyle = this.color;

if(this.type === "fish"){

context.beginPath();
context.ellipse(0,0,this.size*1.5,this.size,0,0,Math.PI*2);
context.fill();

context.beginPath();
context.moveTo(-this.size*1.5,0);
context.lineTo(-this.size*2,this.size);
context.lineTo(-this.size*2,-this.size);
context.fill();

}
else{

context.beginPath();

for(let i=0;i<5;i++){

context.lineTo(0,this.size);
context.translate(0,this.size);
context.rotate(Math.PI/5);

context.lineTo(0,-this.size);
context.translate(0,-this.size);
context.rotate(-Math.PI*3/5);

}

context.closePath();
context.fill();

}

context.restore();

}


/* =========================================
ACTUALIZAR POSICIÓN
========================================= */

update(context){

this.draw(context);

// movimiento lateral
this.posX += this.dx;

// movimiento vertical (solo hacia abajo)
this.posY += this.dy;


// rebote lateral
if(this.posX < 0 || this.posX > canvas.width){

this.dx *= -1;

}


// reaparecer arriba
if(this.posY > canvas.height){

this.posY = -20;

}

}


/* =========================================
REBOTE LATERAL EN COLISIONES
(no afecta caída libre)
========================================= */

bounce(){

this.dx *= -1;

}

}



/* =========================================
VELOCIDAD SEGÚN DIFICULTAD
========================================= */

function getSpeed(){

if(eliminadas >= 30) return Math.random()*2 + 9;

if(eliminadas >= 15) return Math.random()*2 + 6;

return Math.random()*4 + 1;

}



/* =========================================
EVITAR SUPERPOSICIÓN AL GENERAR
========================================= */

function isOverlapping(x,y,size){

for(let obj of objects){

let dx = x - obj.posX;
let dy = y - obj.posY;

let distance = Math.sqrt(dx*dx + dy*dy);

if(distance < size + obj.size){

return true;

}

}

return false;

}



/* =========================================
GENERAR OBJETOS
========================================= */

function generateObjects(n){

for(let i=0;i<n;i++){

if(objects.length >= 20) return;

let size = Math.random()*15 + 15;

let x;
let y;

do{

x = Math.random()*canvas.width;
y = -20;

}while(isOverlapping(x,y,size));

let type = Math.random()>0.5 ? "fish":"star";

let speed = getSpeed();

objects.push(new MarineObject(x,y,size,type,speed));

}

}



/* =========================================
COLISIONES ENTRE OBJETOS
========================================= */

function detectCollisions(){

for(let i=0;i<objects.length;i++){

for(let j=i+1;j<objects.length;j++){

let o1 = objects[i];
let o2 = objects[j];

let dx = o1.posX - o2.posX;
let dy = o1.posY - o2.posY;

let distance = Math.sqrt(dx*dx + dy*dy);

if(distance < o1.size + o2.size && distance>0){

// corregir superposición
let overlap = (o1.size + o2.size) - distance;

let nx = dx/distance;
let ny = dy/distance;

o1.posX += nx * overlap/2;
o1.posY += ny * overlap/2;

o2.posX -= nx * overlap/2;
o2.posY -= ny * overlap/2;

// rebote lateral
o1.bounce();
o2.bounce();

}

}

}

}



/* =========================================
CLICK DEL MOUSE
========================================= */

canvas.addEventListener("click",function(event){

let rect = canvas.getBoundingClientRect();

let mouseX = event.clientX - rect.left;
let mouseY = event.clientY - rect.top;

for(let i=objects.length-1;i>=0;i--){

let dx = mouseX - objects[i].posX;
let dy = mouseY - objects[i].posY;

let distance = Math.sqrt(dx*dx + dy*dy);

if(distance <= objects[i].size){

objects.splice(i,1);
eliminadas++;

break;

}

}

});



/* =========================================
TIEMPO DINÁMICO DE GENERACIÓN
========================================= */

function getGenerationTime(){

let cantidad = objects.length;

if(cantidad <=5) return Math.random()*500+200;

if(cantidad <=10) return Math.random()*1000+500;

if(cantidad <=15) return Math.random()*2000+1000;

return 3000;

}



/* =========================================
REGENERACIÓN AUTOMÁTICA
========================================= */

function regenerate(){

if(objects.length <=19){

regenerationTimer--;

if(regenerationTimer<=0){

if(objects.length<20){

generateObjects(1);

}

regenerationTimer = getGenerationTime()/16;

}

}

}



/* =========================================
CONTADOR DE OBJETOS
========================================= */

function drawObjectsCounter(){

ctx.fillStyle="white";
ctx.font="22px Arial";
ctx.textAlign="left";

ctx.fillText("Objetos: "+objects.length,20,30);

}



/* =========================================
CONTADOR ELIMINADAS
========================================= */

function drawCounter(){

ctx.fillStyle="white";
ctx.font="22px Arial";
ctx.textAlign="right";

ctx.fillText("Eliminadas: "+eliminadas,canvas.width-20,30);

}



/* =========================================
FONDO MARINO
========================================= */

function drawBackground(){

let gradient = ctx.createLinearGradient(0,0,0,canvas.height);

gradient.addColorStop(0,"#0ea5e9");
gradient.addColorStop(0.5,"#0284c7");
gradient.addColorStop(1,"#022c43");

ctx.fillStyle = gradient;

ctx.fillRect(0,0,canvas.width,canvas.height);

}



/* =========================================
ANIMACIÓN PRINCIPAL
========================================= */

function animate(){

drawBackground();

detectCollisions();

objects.forEach(o=>{

o.update(ctx);

});

drawObjectsCounter();
drawCounter();

regenerate();

requestAnimationFrame(animate);

}



/* =========================================
INICIALIZACIÓN
========================================= */

generateObjects(20);

animate();