import "../components/Carousel.js"
import * as THREE from 'three';
import {offerRecentlyConsulted} from "../offerRecentlyConsulted.js";
import {translateCategory, capitalize} from "../utils.js";
import {Carousel} from "../components/Carousel.js";

// -------------------------------------------------------------------------------------------------
// Header background animation
// -------------------------------------------------------------------------------------------------

const fragment = "uniform float time;\n" +
    "uniform float progress;\n" +
    "uniform sampler2D texture1;\n" +
    "uniform vec4 resolution;\n" +
    "varying vec2 vUv;\n" +
    "varying vec3 vPosition;\n" +
    "varying vec3 vColor;\n" +
    "\n" +
    "\n" +
    "void main(){\n" +
    "    gl_FragColor = vec4(vUv, 0.0, 1.0);\n" +
    "    gl_FragColor = vec4(vColor, 1.0);\n" +
    "}"

const vertex = "uniform float time;\n" +
    "varying vec2 vUv;\n" +
    "varying vec3 vPosition;\n" +
    "varying vec3 vColor;\n" +
    "uniform vec3 uColor[5];\n" +
    "uniform vec2 pixels;\n" +
    "float PI = 3.14159265359;\n" +
    "\n" +
    "//\tSimplex 3D Noise \n" +
    "//\tby Ian McEwan, Ashima Arts\n" +
    "//\n" +
    "vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}\n" +
    "vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}\n" +
    "\n" +
    "float snoise(vec3 v){ \n" +
    "  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;\n" +
    "  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);\n" +
    "\n" +
    "// First corner\n" +
    "  vec3 i  = floor(v + dot(v, C.yyy) );\n" +
    "  vec3 x0 =   v - i + dot(i, C.xxx) ;\n" +
    "\n" +
    "// Other corners\n" +
    "  vec3 g = step(x0.yzx, x0.xyz);\n" +
    "  vec3 l = 1.0 - g;\n" +
    "  vec3 i1 = min( g.xyz, l.zxy );\n" +
    "  vec3 i2 = max( g.xyz, l.zxy );\n" +
    "\n" +
    "  //  x0 = x0 - 0. + 0.0 * C \n" +
    "  vec3 x1 = x0 - i1 + 1.0 * C.xxx;\n" +
    "  vec3 x2 = x0 - i2 + 2.0 * C.xxx;\n" +
    "  vec3 x3 = x0 - 1. + 3.0 * C.xxx;\n" +
    "\n" +
    "// Permutations\n" +
    "  i = mod(i, 289.0 ); \n" +
    "  vec4 p = permute( permute( permute( \n" +
    "             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))\n" +
    "           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) \n" +
    "           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));\n" +
    "\n" +
    "// Gradients\n" +
    "// ( N*N points uniformly over a square, mapped onto an octahedron.)\n" +
    "  float n_ = 1.0/7.0; // N=7\n" +
    "  vec3  ns = n_ * D.wyz - D.xzx;\n" +
    "\n" +
    "  vec4 j = p - 49.0 * floor(p * ns.z *ns.z);  //  mod(p,N*N)\n" +
    "\n" +
    "  vec4 x_ = floor(j * ns.z);\n" +
    "  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)\n" +
    "\n" +
    "  vec4 x = x_ *ns.x + ns.yyyy;\n" +
    "  vec4 y = y_ *ns.x + ns.yyyy;\n" +
    "  vec4 h = 1.0 - abs(x) - abs(y);\n" +
    "\n" +
    "  vec4 b0 = vec4( x.xy, y.xy );\n" +
    "  vec4 b1 = vec4( x.zw, y.zw );\n" +
    "\n" +
    "  vec4 s0 = floor(b0)*2.0 + 1.0;\n" +
    "  vec4 s1 = floor(b1)*2.0 + 1.0;\n" +
    "  vec4 sh = -step(h, vec4(0.0));\n" +
    "\n" +
    "  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;\n" +
    "  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;\n" +
    "\n" +
    "  vec3 p0 = vec3(a0.xy,h.x);\n" +
    "  vec3 p1 = vec3(a0.zw,h.y);\n" +
    "  vec3 p2 = vec3(a1.xy,h.z);\n" +
    "  vec3 p3 = vec3(a1.zw,h.w);\n" +
    "\n" +
    "//Normalise gradients\n" +
    "  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));\n" +
    "  p0 *= norm.x;\n" +
    "  p1 *= norm.y;\n" +
    "  p2 *= norm.z;\n" +
    "  p3 *= norm.w;\n" +
    "\n" +
    "// Mix final noise value\n" +
    "  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);\n" +
    "  m = m * m;\n" +
    "  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), \n" +
    "                                dot(p2,x2), dot(p3,x3) ) );\n" +
    "}\n" +
    "\n" +
    "void main(){\n" +
    "\n" +
    "    vec2 noiseCoord = uv * vec2(3., 4.);\n" +
    "\n" +
    "    float tilt = -0.8 * uv.y;\n" +
    "\n" +
    "    float incline = uv.x * 0.5;\n" +
    "\n" +
    "    float offset = incline * mix(-.25, 0.25, uv.y);\n" +
    "\n" +
    "    float noise = snoise(vec3(noiseCoord.x + time * 3., noiseCoord.y, time * 10.));\n" +
    "\n" +
    "    vec3 pos = vec3(position.x, position.y, position.z + noise * 0.3 + tilt + incline + offset);\n" +
    "\n" +
    "\n" +
    "    vColor = uColor[4];\n" +
    "\n" +
    "    for(int i = 0; i < 4; i++) {\n" +
    "\n" +
    "        float noiseFlow = 5. + float(i) * 0.3;\n" +
    "        float noiseSpeed = 10. + float(i) * 0.3;\n" +
    "\n" +
    "        float noiseSeed = 1. + float(i) * 10.;\n" +
    "\n" +
    "        vec2 noiseFreq = vec2(.3, .4);\n" +
    "\n" +
    "        float noise = snoise(\n" +
    "          vec3(\n" +
    "            noiseCoord.x*noiseFreq.x + time * noiseFlow,\n" +
    "            noiseCoord.y*noiseFreq.y,\n" +
    "            time * noiseSpeed + noiseSeed\n" +
    "          )\n" +
    "        );\n" +
    "\n" +
    "        vColor = mix(vColor, uColor[i], noise);\n" +
    "\n" +
    "    }\n" +
    "\n" +
    "\n" +
    "    vUv = uv;\n" +
    "    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);\n" +
    "}"


export class Sketch {
    constructor(options) {
        this.scene = new THREE.Scene();

        this.container = options.dom;
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(this.width, this.height);
        this.renderer.setClearColor(0xffffff, 1);
        this.clock = new THREE.Clock();
        this.container.appendChild(this.renderer.domElement);

        this.camera = new THREE.PerspectiveCamera(
            70,
            this.width / this.height,
            0.01,
            1000,
        );

        this.camera.position.set(0, 0, 0.4);
        this.time = 0;
        this.uniforms = {
            time: {value: 1.0},
            resolution: {value: new THREE.Vector2()},
            mouse: {value: new THREE.Vector2()},
        };

        this.isPlaying = true;

        this.addObjects();
        this.resize();
        this.render();
        this.addLights();
        this.setupResize();
    }

    setupResize() {
        window.addEventListener("resize", this.resize.bind(this));
    }

    resize() {
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        this.renderer.setSize(this.width, this.height);
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();

        this.uniforms.resolution.value.x = this.width;
        this.uniforms.resolution.value.y = this.height;
    }

    handleMouseMove() {
        window.addEventListener("mousemove", (e) => {
            this.uniforms.mouse.value.x = e.pageX;
            this.uniforms.mouse.value.y = e.pageY;
        });
    }

    addObjects() {
        this.material = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: vertex,
            fragmentShader: fragment,
        });

        let size = 2.5;
        let paletteHex = [
            '#d6eeff',
            '#daf8ff',
            '#d4e5ff',
            '#ffffff',
            '#e1f2ff',
        ];
        let palette = paletteHex.map((color) => new THREE.Color(color))

        this.material.uniforms.uColor = {value: palette};

        this.geometry = new THREE.PlaneGeometry(size, size, 100, 100);
        this.plane = new THREE.Mesh(this.geometry, this.material);
        this.plane.position.set(-0.4, 0, 0);
        this.scene.add(this.plane);
    }

    addLights() {
        const light1 = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(light1);

        const light2 = new THREE.DirectionalLight(0xffffff, 0.5);
        light2.position.set(0.5, 0, 0.866);
        this.scene.add(light2);
    }

    render() {
        if (!this.isPlaying) return;

        requestAnimationFrame(this.render.bind(this));
        this.time += this.clock.getDelta() * 0.01;
        this.uniforms.time.value = this.time;
        this.renderer.render(this.scene, this.camera);
    }
}

new Sketch({
    dom: document.querySelector("#background"),
});

// -------------------------------------------------------------------------------------------------
// Header title animation
// -------------------------------------------------------------------------------------------------

function splitTextIntoSpans(element) {
    // Get the text content of the element
    const text = element.textContent;

    // Clear the element's text
    element.textContent = '';

    // Loop through each character of the text and wrap it in a <span>
    for (let i = 0; i < text.length; i++) {
        const letter = document.createElement('span');
        letter.textContent = text[i];
        element.appendChild(letter);
    }

    // Return the array of span elements
    return Array.from(element.getElementsByTagName('span'));
}

var vsOpts = {
    slides: document.querySelectorAll('.title-slides span'),
    list: document.querySelector('.title-slides'),
    duration: 0.3,
    lineHeight: 50
}

var vSlide = gsap.timeline({
    paused: true,
    repeat: -1,
    // duration: 2.0
});

vsOpts.slides.forEach(function (slide, i) {
    // Move each letter
    let letters = splitTextIntoSpans(slide);
    let tween = gsap.from(letters, {
        duration: vsOpts.duration,
        y: 50,
        repeat: 1,
        yoyo: true,
        stagger: vsOpts.duration / 10,
        repeatDelay: 4,
    });
    let tween2 = gsap.to(vsOpts.list, {
        width: slide.offsetWidth,
        duration: vsOpts.duration,
    })

    vSlide.add(tween);
    vSlide.add(tween2, '<');
})
vSlide.play();


// -------------------------------------------------------------------------------------------------
// Search input
// -------------------------------------------------------------------------------------------------

let searchBar = document.getElementById("searchBar");
let searchButton = document.getElementById("searchButton");

searchButton.addEventListener("click", () => {
    let searchValue = searchBar.value;
    goSearchPage(searchValue);
});
searchBar.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
        let searchValue = searchBar.value;
        goSearchPage(searchValue);
    }
});

function goSearchPage(text) {
    window.location.href = `/recherche?search=${text}`;
}


// -------------------------------------------------------------------------------------------------
// Maps
// -------------------------------------------------------------------------------------------------

const cities = ["Bréhat", "Plouha", "Lannion", "Pléneuf", "Paimpol", "Erquy", "Pontrieux", "Saint-Brieuc"];
const citiesContainer = document.querySelector(".cities");

function createCityCard(theta, name) {
    let card = document.createElement("a");
    card.href = `/recherche?city=${name}`;
    card.title = `Accèder aux offres à ${name}`;
    card.classList.add("city-card");
    card.innerHTML += `
        <div class="front">
            <p>${name}</p>
            <img src="/assets/images/homeCarouselImages/${name}.jpg" alt="${name}">
        </div>
        <img class="background" src="/assets/images/homeCarouselImages/${name}.jpg" alt="${name}">
    `;

    card.style.left = 50 + (50 * Math.cos(theta)) + "%";
    card.style.top = 50 + (50 * Math.sin(theta)) + "%";

    return card;
}

cities.forEach((city, index) => {
    let angle = ((Math.PI * 2) / cities.length) * index;
    citiesContainer.appendChild(createCityCard(angle, city));
})


// -------------------------------------------------------------------------------------------------
// Recently consulted offers
// -------------------------------------------------------------------------------------------------

function createOfferCard(offer) {
    return `
        <div class="home-card">
            <a href="/offres/${offer.id}" title="Voir l'offre ${offer.title}">
                <!-- Image -->
                <div class="image-container">
                    <img src="${offer.photo}"
                         alt="Image de ${offer.title}">
                    <!-- Nice background on hover -->
                    <img class="image-bg" src="${offer.photo}"
                         alt="Image de ${offer.title}">

                    <!-- Localization -->
                    <div class="flex gap-2 justify-center items-center localization">
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15"
                             viewBox="0 0 24 24"
                             fill="none" stroke="currentColor" stroke-width="3"
                             stroke-linecap="round"
                             stroke-linejoin="round" class="lucide lucide-map-pin">
                            <path
                                d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/>
                            <circle cx="12" cy="10" r="3"/>
                        </svg>
                        <p>${offer.location}</p>
                    </div>

                    <!-- Stars + Avis -->
                    <div class="flex gap-2 stars-container">
                        <!-- TODO -->
                        <!-- <div class="stars" data-number="<?php echo $offer["rating"] ?>"> -->
                        <div class="stars" data-number="${offer.rating}">
                        </div>
                    </div>
                </div>

                <div class="card-content">
                    <!-- Title and summary -->
                    <h2>${offer.title}</h2>
                    <p class="summary text-ellipsis">${offer.summary}</p>

                    <div class="flex flex-col gap-2">
                        <!-- Type + Professional -->
                        <p class="text-sm">${capitalize(translateCategory(offer.category))} proposé par <a
                                href="/" title="accèder au profil de ${offer.author}">${offer.author}</a></p>
                    </div>
                </div>
            </div>
    `;
}

async function fetchOffers() {
    // Fetch all offers in parallel instead of sequentially
    const offerPromises = offerRecentlyConsulted.offerIds.map(offerId =>
        fetch(`/api/offers/${offerId}`).then(response => response.json())
    );

    return await Promise.all(offerPromises);
}

if (offerRecentlyConsulted.offerIds.length > 0) {
    fetchOffers().then((offers) => {
        let carousel = document.querySelector(".recently-consulted-carousel");
        console.log(offers)

        // Use a temporary container to build all HTML at once instead of repeatedly modifying innerHTML
        const tempContainer = document.createElement('div');
        for (let offer of offers) {
            tempContainer.innerHTML += createOfferCard(offer);
        }
        carousel.appendChild(tempContainer);

        new Carousel(carousel, {
            slidesToScroll: 1,
            slidesVisible: 3,
            loop: false,
            pagination: false,
            navigation: true,
            slidesVisibleMobile: 1,
        });
    })
} else {
    document.querySelector(".recently-consulted").style.display = "none";
}
