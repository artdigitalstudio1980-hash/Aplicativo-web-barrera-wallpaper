import Replicate from "replicate";

async function testReplicate() {
  const apiKey = "r8_JHL6qzgT2WD9ziIcA7pCEHWK6IKdtCO1nFWFT";
  const replicate = new Replicate({
    auth: apiKey,
  });

  console.log("🔍 Verificando conexión con Replicate (Flux 2 Pro)...");
  
  try {
    const output = await replicate.run(
      "black-forest-labs/flux-schnell",
      {
        input: {
          prompt: "A luxurious and minimalist wallpaper design, gold leaf accents, textured ivory paper, soft indirect lighting, captured on Hasselblad, 8k resolution, elegant, high-end interior.",
          aspect_ratio: "1:1",
          output_format: "webp",
          output_quality: 80,
        }
      }
    );
    
    console.log("-----------------------------------------");
    console.log("✅ ¡REPLICATE ESTÁ FUNCIONANDO!");
    console.log("URL de la imagen generada:");
    console.log(output);
    console.log("-----------------------------------------");
    console.log("🚀 El motor FLUX está listo para Barrera Wallpaper.");
    
  } catch (error: any) {
    console.error("❌ ERROR AL CONECTAR CON REPLICATE:");
    console.error(error.message);
  }
}

testReplicate();
