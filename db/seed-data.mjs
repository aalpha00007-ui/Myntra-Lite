// Demo catalogue for Myntra-Lite: 27 made-up products with free Unsplash photos,
// and 40 generated reviews each. Every review records the reviewer's height, build,
// usual size, the size they kept and how it fitted - the facts Fit Twin works from.
const SIZES={top:["XS","S","M","L","XL","XXL"],waist:["28","30","32","34","36"],shoe:["6","7","8","9","10","11"]};
const SYS_LABEL={top:"size",waist:"waist",shoe:"UK size"};
const P=(o)=>o;
const ITEMS=[
 P({id:"dress",g:"women",type:"dress",sub:"Dresses",brand:"Kalpa Studio",name:"Linen Shirt Dress",price:1899,sys:"top",c:["#9fb391","#6f8562"],bg:"#eef2ea",
  rule:(r,n)=>r.build==="slim"&&n()<.55?-1:(n()<.12?1:0),
  notes:{small:["Tight across the chest, should have sized up.","Snug at the arms when I sit."],true:["Fits exactly like my usual size.","Falls nicely, true to size.","Length hits just below the knee as shown."],large:["Loose at the waist, the belt helps but I'd size down.","Roomy all over on a narrow frame."]},
  q:["Linen is soft after one wash.","Creases quickly, needs ironing.","Colour matches the listing photos.","Slightly see-through in sunlight, wear a slip.","Buttons feel sturdy."]}),
 P({id:"kurta",g:"women",type:"kurta",sub:"Ethnic Wear",brand:"Neel Bagh",name:"Embroidered Kurta Set",price:2499,sys:"top",c:["#b3262f","#7a1a20"],bg:"#f8ece3",
  rule:(r,n)=>n()<(r.build==="broad"?.8:r.build==="regular"?.6:.25)?1:0,
  notes:{small:["Runs small. Tight at the armholes in my usual size.","Kurta is fine but the pants are tight at the hips."],true:["Fits well, comfortable all day.","Neat fit through the shoulders."],large:["Too loose, the kurta looks boxy."]},
  q:["Pure cotton, breathable for summer.","Embroidery is neat and even.","Dupatta is thin but not see-through.","Colour bled a little in the first wash.","Stitching is neat."]}),
 P({id:"wtrous",g:"women",type:"trousers",sub:"Trousers",brand:"Mira & Co",name:"Wide-Leg Trousers",price:1499,sys:"waist",c:["#5f7f5a","#3f5a3b"],bg:"#f4f0e8",
  rule:(r,n)=>r.h<158&&n()<.4?-1:(n()<.15?1:0),
  notes:{small:["Snug at the hips.","Waist is tight when seated."],true:["True to waist size, flows nicely.","Comfortable high waist, fits as expected."],large:["Waist too big, needed a belt.","Very long on me, had to hem."]},
  q:["Fabric drapes well.","Wrinkles less than linen.","Colour is a soft green, as shown.","Pockets are a bit shallow.","Good for office wear."]}),
 P({id:"skirt",g:"women",type:"skirt",sub:"Skirts",brand:"Kalpa Studio",name:"Floral Print Skirt",price:1299,sys:"waist",c:["#e9eef6","#4a6fa5"],bg:"#f9ecf1",
  rule:(r,n)=>n()<.12?-1:0,
  notes:{small:["Elastic is tight.","Snug at the waist."],true:["True to size, elastic is comfortable.","Fits well and sits at the waist."],large:["Slides down a little, size down."]},
  q:["Lining is soft.","Print is bright like the photos.","Light fabric, good for summer.","Slightly see-through without lining in sunlight.","Hem is neatly finished."]}),
 P({id:"sandal",g:"women",type:"sandal",sub:"Heels",brand:"Stepwell",name:"Leather Heeled Sandals",price:1799,sys:"shoe",c:["#8a5a3a","#5e3c25"],bg:"#f6eee6",
  rule:(r,n)=>n()<.5?1:0,
  notes:{small:["Runs small, toes press at the front.","Strap is tight on a wide foot."],true:["True to UK size.","Comfortable heel height, fits well."],large:["Heel slips, half a size big."]},
  q:["Comfortable for a full day.","Strap buckle feels sturdy.","Sole is a bit slippery on tiles.","Colour is a warm tan.","Cushioning is soft."]}),
 P({id:"shirt",g:"men",type:"shirt",sub:"Shirts",brand:"Coastline",name:"White Linen Shirt",price:1299,sys:"top",c:["#f1eee6","#cfc8b5"],bg:"#eef0f3",
  rule:(r,n)=>r.prefRelaxed&&n()<.4?1:(n()<.15?-1:0),
  notes:{small:["A bit fitted, I like it looser.","Slim cut, tight at the chest."],true:["Regular fit, true to size.","Good fit, sleeves are the right length."],large:["Boxy on me, size down if you are slim."]},
  q:["Slightly sheer, white vest needed.","Shrank a little after a hot wash.","Breathable and light.","Collar stays crisp.","Linen-cotton blend, not pure linen."]}),
 P({id:"tee",g:"men",type:"tee",sub:"T-Shirts",brand:"Coastline",name:"Crew Neck Cotton T-Shirt",price:699,sys:"top",c:["#3e6e8e","#28506b"],bg:"#e8eff4",
  rule:(r,n)=>n()<.1?1:0,
  notes:{small:["Slightly short in length."],true:["True to size, regular fit.","Fits well, not too tight."],large:["A bit loose at the sleeves."]},
  q:["Soft cotton, thick enough.","Colour hasn't faded after five washes.","Colour is deeper than the photos.","Neck holds shape.","Good value basic."]}),
 P({id:"blazer",g:"men",type:"blazer",sub:"Blazers",brand:"Charcoal & Co",name:"Navy Formal Blazer",price:3999,sys:"top",c:["#4a5878","#232c45"],bg:"#e9ebf1",
  rule:(r,n)=>r.build==="broad"&&n()<.75?1:(n()<.1?1:0),
  notes:{small:["Shoulders are tight, I can't lift my arms properly.","Chest button pulls in my usual size."],true:["Sharp fit through the shoulders.","Fits like a tailored blazer in my usual size."],large:["Sleeves too long and loose."]},
  q:["Fabric has a slight sheen, looks formal.","Lining is thin.","Holds shape well after a full day.","Colour is darker navy than shown.","Wrinkles on the back after sitting."]}),
 P({id:"cargo",g:"men",type:"cargo",sub:"Trousers",brand:"Northline",name:"Utility Cargo Trousers",price:1599,sys:"waist",c:["#7a5c3e","#4e3a27"],bg:"#eef0e6",
  rule:(r,n)=>r.build==="slim"&&n()<.6?-1:(r.h<158&&n()<.5?-1:0),
  notes:{small:["Tight at the thighs.","Waist is a bit snug after lunch."],true:["True to waist size.","Fits well, length is good for my height."],large:["Waist gapes, I needed a belt.","Baggy on me, should have gone one size down."]},
  q:["Thick cotton twill, feels durable.","Pockets are deep and useful.","Length is long, I folded it once.","Colour is a deeper brown than the photos.","Zip feels a bit cheap."]}),
 P({id:"jeans",g:"men",type:"jeans",sub:"Jeans",brand:"Northline",name:"Slim Fit Jeans",price:1999,sys:"waist",c:["#4f6d95","#2f4a70"],bg:"#e7edf5",
  rule:(r,n)=>n()<(r.build==="broad"?.6:r.build==="regular"?.3:.05)?1:0,
  notes:{small:["Tight at the thighs, size up if you have strong legs.","Waist fits but the seat is snug."],true:["True to size with a little stretch.","Fits well, nice taper."],large:["Loose at the waist."]},
  q:["Denim has good stretch.","Colour bled slightly in the first wash.","Stitching is strong.","Length is right for 5'8\".","Feels thick, good for winter."]}),
 P({id:"sneaker",g:"men",type:"sneaker",sub:"Sneakers",brand:"Stridex",name:"Running Sneakers",price:3499,sys:"shoe",c:["#f2f2f2","#e8762b"],bg:"#eeeff1",
  rule:(r,n)=>n()<.12?1:0,
  notes:{small:["Narrow at the toes."],true:["True to UK size.","Fits well, good arch support."],large:["Bit roomy, thick socks help."]},
  q:["Very comfortable for walking.","Sole is heavy.","Looks exactly like the photos.","Laces are long.","Breathable mesh upper."]}),
 P({id:"boot",g:"men",type:"boot",sub:"Boots",brand:"Stepwell",name:"Leather Chelsea Boots",price:2999,sys:"shoe",c:["#6b4226","#3e2616"],bg:"#efebe8",
  rule:(r,n)=>n()<.45?-1:0,
  notes:{small:["Tight over the instep."],true:["True to size, snug as boots should be.","Fits well after a short break-in."],large:["Runs large, heel slips. Size down.","Roomy, I added an insole."]},
  q:["Leather softens after a week.","Elastic sides feel strong.","Sole is a little hard at first.","Polishes well.","Looks premium for the price."]})
];
const EXTRA=[{"id": "shirt2", "base": "shirt", "brand": "Urban Thread", "name": "Black Casual Shirt", "price": 1499, "c": ["#1f1f22", "#000000"], "bg": "#ececee", "sub": "Shirts"}, {"id": "shirt3", "base": "shirt", "brand": "Northline", "name": "Red Checked Casual Shirt", "price": 1199, "c": ["#b2302f", "#2a2a2a"], "bg": "#f3e9e8", "sub": "Shirts"}, {"id": "shirt4", "base": "shirt", "brand": "Coastline", "name": "Grey Checked Shirt", "price": 1349, "c": ["#8e9298", "#5c6066"], "bg": "#eceef0", "sub": "Shirts"}, {"id": "tee2", "base": "tee", "brand": "Urban Thread", "name": "White Crew Neck T-Shirt", "price": 599, "c": ["#f5f5f5", "#cfcfcf"], "bg": "#f1f1f1", "sub": "T-Shirts"}, {"id": "tee3", "base": "tee", "brand": "Urban Thread", "name": "Black Crew Neck T-Shirt", "price": 599, "c": ["#222", "#000"], "bg": "#ececee", "sub": "T-Shirts"}, {"id": "polo", "base": "tee", "brand": "Coastline", "name": "Patterned Polo T-Shirt", "price": 899, "c": ["#9cc3e0", "#5f8fb4"], "bg": "#eaf2f8", "sub": "T-Shirts"}, {"id": "blazer2", "base": "blazer", "brand": "Charcoal & Co", "name": "Black Suit Blazer", "price": 4499, "c": ["#26272b", "#0e0f11"], "bg": "#ececee", "sub": "Blazers"}, {"id": "kurta2", "base": "kurta", "brand": "Neel Bagh", "name": "Yellow Tiered Kurta", "price": 1899, "c": ["#e8c13a", "#b38f12"], "bg": "#faf3dc", "sub": "Ethnic Wear"}, {"id": "kurta3", "base": "kurta", "brand": "Neel Bagh", "name": "Paisley Print Kurta", "price": 1699, "c": ["#22325e", "#121c38"], "bg": "#e8ebf3", "sub": "Ethnic Wear"}, {"id": "kurta4", "base": "kurta", "brand": "Rangreza", "name": "Maroon Kurta Set", "price": 2199, "c": ["#7a1f2c", "#4d121b"], "bg": "#f3e6e8", "sub": "Ethnic Wear"}, {"id": "dress2", "base": "dress", "brand": "Mira & Co", "name": "Black Midi Dress", "price": 2299, "c": ["#1f1f22", "#000"], "bg": "#ececee", "sub": "Dresses"}, {"id": "wtrous2", "base": "wtrous", "brand": "Mira & Co", "name": "White Linen Trousers", "price": 1599, "c": ["#f4f2ec", "#cfcabd"], "bg": "#f4f2ec", "sub": "Trousers"}, {"id": "sneaker2", "base": "sneaker", "brand": "Stridex", "name": "White Low-Top Sneakers", "price": 2799, "c": ["#f7f7f7", "#d8d8d8"], "bg": "#f2f2f2", "sub": "Sneakers"}, {"id": "loafer1", "base": "boot", "brand": "Stepwell", "name": "Brown Suede Loafers", "price": 2499, "c": ["#7b5234", "#4e3220"], "bg": "#f1ebe5", "sub": "Loafers"}, {"id": "loafer2", "base": "boot", "brand": "Stepwell", "name": "Black Leather Loafers", "price": 2299, "c": ["#1c1c1c", "#000"], "bg": "#f2f2f2", "sub": "Loafers"}];
EXTRA.forEach(e=>{const b=ITEMS.find(i=>i.id===e.base);const o=Object.assign({},b,e);delete o.base;if(e.id.startsWith("loafer")){o.rule=(r,n)=>n()<.2?1:0;o.notes={small:["Snug at the toes for the first few days."],true:["True to UK size, easy to slip on.","Comfortable fit from day one."],large:["Heel slips a little, half a size big."]};o.q=["Leather looks premium.","Sole has good grip.","Very comfortable for office.","Colour matches the photos.","Stitching is neat."];}ITEMS.push(o);});

const PHOTO={"dress": "1747396206869-75ea57b325ce", "kurta": "1759840278361-f1adc75529a1", "wtrous": "1687825515654-23620796760c", "skirt": "1789110854735-67c4e4737aa2", "sandal": "1630386474440-8f2e6d752a98", "shirt": "1627686011747-74adda3d2343", "tee": "1734249024828-f89d910cc69c", "blazer": "1717730798531-6a62ed43b871", "cargo": "1511794322962-129ddbd0af38", "jeans": "1555689502-c4b22d76c56f", "sneaker": "1560769629-975ec94e6a86", "boot": "1777987601677-3059be0e1388", "shirt2": "1626859130267-7959f7326c3a", "shirt3": "1630355734650-55fe91e1e5c7", "shirt4": "1786729135040-71d84986d968", "tee2": "1587057173081-36bc799b78ad", "tee3": "1620456628237-d7c36af17a8e", "polo": "1779907448384-bcd21af9bbbf", "blazer2": "1617113930975-f9c7243ae527", "kurta2": "1760287363878-1a09af715b80", "kurta3": "1760287364219-160c234ded00", "kurta4": "1708534246055-d7b149acb731", "dress2": "1552014785-a6e5f8bc9131", "wtrous2": "1608497275992-b04e06353862", "sneaker2": "1656164753657-8ff832063a71", "loafer1": "1676121270762-47c8d3a7b9d5", "loafer2": "1760616172899-0681b97a2de3"};

function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const pick=(a,n)=>a[Math.floor(n()*a.length)];
function baseIdx(sys,h){return sys==="top"?Math.round((h-150)/9):sys==="waist"?Math.round((h-156)/9):Math.round((h-150)/7)}
function makeReviews(it,idx){
  const n=rng(1000+idx*97),out=[],sz=SIZES[it.sys];
  for(let i=0;i<40;i++){
    const bb=n(),build=bb<.3?"slim":bb<.75?"regular":"broad",h=Math.round(152+n()*34);
    const adj=it.sys==="shoe"?0:(build==="broad"?1:build==="slim"?-1:0);
    const ui=clamp(baseIdx(it.sys,h)+adj+Math.round(n()*2-1),0,sz.length-1);
    const r={h,build,usual:sz[ui],prefRelaxed:n()<.3};
    const off=it.rule(r,n);let ki,fit;
    if(n()<.55){ki=ui;fit=off>0?"small":off<0?"large":"true";}
    else{ki=clamp(ui+off,0,sz.length-1);fit=(ki-ui)===off?"true":(off>0?"small":"large");}
    r.kept=sz[ki];r.fit=fit;r.rating=fit==="true"?(n()<.6?5:4):(n()<.5?3:(n()<.5?2:4));
    const fn=fit==="true"&&ki>ui?"Sized up as other reviews suggested, fits well.":fit==="true"&&ki<ui?"Sized down from my usual, fits well.":pick(it.notes[fit],n);
    r.text=fn+" "+pick(it.q,n);r.photo=n()<.4;r.days=1+Math.floor(n()*90);out.push(r);
  }
  return out;
}

export const SIZES_BY_SYSTEM = SIZES;

export function catalogue() {
  return ITEMS.map((it, i) => ({
    id: it.id,
    gender: it.g,
    department: it.sys === "shoe" ? "footwear" : it.g,
    sub: it.sub,
    brand: it.brand,
    name: it.name,
    price: it.price,
    sizeSystem: it.sys,
    photo: PHOTO[it.id],
    colour: it.c[0],
    reviews: makeReviews(it, i),
  }));
}
