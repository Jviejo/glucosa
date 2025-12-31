import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey || apiKey === 'tu_api_key_aqui') {
      return NextResponse.json(
        { error: "API key de Anthropic no configurada. Por favor, edita el archivo .env.local" },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const imageFile = formData.get("image") as File;

    if (!imageFile) {
      return NextResponse.json(
        { error: "No se proporcionó ninguna imagen" },
        { status: 400 }
      );
    }

    // Convertir la imagen a base64
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString("base64");

    // Determinar el tipo de imagen
    const imageType = imageFile.type.split("/")[1] as "jpeg" | "png" | "gif" | "webp";

    // Crear cliente de Anthropic
    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    // Llamar a la API de Claude con la imagen
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: `image/${imageType}`,
                data: base64Image,
              },
            },
            {
              type: "text",
              text: `Analiza esta curva de glucosa en sangre. Por favor proporciona:

1. **Resumen General**: Una evaluación general del control glucémico mostrado en la gráfica.

2. **Niveles Observados**:
   - Identificar períodos de hiperglucemia (glucosa alta)
   - Identificar períodos de hipoglucemia (glucosa baja)
   - Identificar períodos en rango objetivo (normalmente 70-180 mg/dL)

3. **Patrones y Tendencias**:
   - Variabilidad glucémica (estabilidad vs. fluctuaciones)
   - Patrones relacionados con comidas (si son visibles)
   - Momentos críticos del día

4. **Recomendaciones**:
   - Sugerencias para mejorar el control
   - Posibles ajustes en alimentación o medicación (mencionar que deben consultarse con un médico)
   - Áreas de enfoque prioritario

Por favor, sé específico y detallado en tu análisis. Recuerda que este análisis es informativo y no sustituye la evaluación de un profesional de la salud.`,
            },
          ],
        },
      ],
    });

    // Extraer el texto de la respuesta
    const analysis = message.content[0].type === "text"
      ? message.content[0].text
      : "No se pudo obtener el análisis";

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Error al analizar la imagen:", error);
    return NextResponse.json(
      { error: "Error al procesar la imagen con Claude API" },
      { status: 500 }
    );
  }
}
