"use client";

import { useState } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [analysisTime, setAnalysisTime] = useState<number | null>(null);

  const exampleImages = [
    "/IMG_62A9959E68C1-1.jpeg",
    "/IMG_AA2C3E7D3F44-1.jpeg",
    "/IMG_BCE5DCD75685-1.jpeg",
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setAnalysis("");
      setError("");
      setAnalysisTime(null);
    }
  };

  const handleExampleClick = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], imageUrl.split("/").pop() || "example.jpeg", {
        type: blob.type,
      });
      setSelectedImage(file);
      setPreviewUrl(imageUrl);
      setAnalysis("");
      setError("");
      setAnalysisTime(null);
    } catch (err) {
      setError("Error al cargar la imagen de ejemplo");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedImage) {
      setError("Por favor, selecciona una imagen primero");
      return;
    }

    setLoading(true);
    setError("");
    setAnalysis("");
    setAnalysisTime(null);

    const startTime = performance.now();

    try {
      const formData = new FormData();
      formData.append("image", selectedImage);

      const response = await fetch("/api/analyze-glucose", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al analizar la imagen");
      }

      const endTime = performance.now();
      const timeInSeconds = ((endTime - startTime) / 1000).toFixed(2);

      setAnalysis(data.analysis);
      setAnalysisTime(parseFloat(timeInSeconds));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <main className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Análisis de Curva de Glucosa
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Sube una imagen de tu curva de glucosa y obtén un análisis detallado con IA
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="image-upload"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Imagen de la curva de glucosa
              </label>
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-900 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500"
                >
                  {previewUrl ? (
                    <div className="relative w-full h-full p-4">
                      <Image
                        src={previewUrl}
                        alt="Vista previa"
                        fill
                        className="object-contain rounded-lg"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg
                        className="w-12 h-12 mb-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Click para subir</span> o arrastra la imagen
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        PNG, JPG, GIF o WEBP
                      </p>
                    </div>
                  )}
                  <input
                    id="image-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={!selectedImage || loading}
              className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-3"
            >
              {loading && (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              )}
              {loading ? "Analizando..." : "Analizar Curva de Glucosa"}
            </button>
          </form>

          {error && (
            <div className="mt-6 p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 rounded-lg">
              <p className="font-semibold">Error:</p>
              <p>{error}</p>
            </div>
          )}

          <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              O prueba con un ejemplo:
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {exampleImages.map((imageUrl, index) => (
                <div
                  key={index}
                  onClick={() => handleExampleClick(imageUrl)}
                  className="cursor-pointer border-2 border-gray-300 dark:border-gray-600 hover:border-indigo-500 rounded-lg p-2 bg-white dark:bg-gray-800 transition-all hover:shadow-lg"
                >
                  <img
                    src={imageUrl}
                    alt={`Ejemplo ${index + 1}`}
                    className="w-full h-auto rounded"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {analysis && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Análisis de Claude
              </h2>
              {analysisTime !== null && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="font-medium">{analysisTime}s</span>
                </div>
              )}
            </div>
            <div className="prose dark:prose-invert max-w-none prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-strong:text-gray-900 dark:prose-strong:text-white prose-ul:text-gray-700 dark:prose-ul:text-gray-300 prose-li:text-gray-700 dark:prose-li:text-gray-300">
              <ReactMarkdown>{analysis}</ReactMarkdown>
            </div>
            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Nota importante:</strong> Este análisis es informativo y generado por IA.
                No sustituye la evaluación de un profesional de la salud. Consulta siempre con tu
                médico sobre tus niveles de glucosa y tratamiento.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
