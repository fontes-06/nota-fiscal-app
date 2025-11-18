import React, { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";

function parseNFeFromQR(raw) {
  const base = {
    raw,
    value: null,
    emitter: null,
    cnpj: null,
  };

  let url;
  try {
    url = new URL(raw);
  } catch {
    if (raw.includes("|")) {
      const parts = raw.split("|");
      if (parts.length >= 5) {
        const maybeValue = parts.find((p) => p.includes(",") || p.includes("."));
        if (maybeValue && !Number.isNaN(parseFloat(maybeValue.replace(",", ".")))) {
          base.value = parseFloat(maybeValue.replace(",", "."));
        }
      }
      return base;
    }
    return base;
  }

  const params = url.searchParams;

  const vNF = params.get("vNF") || params.get("vTotTrib");
  if (vNF && !Number.isNaN(parseFloat(vNF))) {
    base.value = parseFloat(vNF);
  }

  const xNome = params.get("xNome") || params.get("emit");
  if (xNome) {
    base.emitter = xNome;
  }

  const cnpj =
    params.get("CNPJ") ||
    params.get("emitCNPJ") ||
    params.get("cnpj") ||
    params.get("cCNPJ");
  if (cnpj) {
    base.cnpj = cnpj;
  }

  return base;
}

const Scanner = ({ onInvoiceRead }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let stream;

    const startCamera = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setError(
            "Navegador não suporta acesso à câmera. Tente pelo celular ou outro navegador."
          );
          return;
        }

        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setIsScanning(true);
          window.requestAnimationFrame(scanLoop);
        }
      } catch (err) {
        console.error(err);
        setError(
          "Não foi possível acessar a câmera. Verifique as permissões do navegador."
        );
      }
    };

    startCamera();

    return () => {
      setIsScanning(false);
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scanLoop = () => {
    if (!isScanning) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) {
      window.requestAnimationFrame(scanLoop);
      return;
    }

    const width = video.videoWidth;
    const height = video.videoHeight;
    if (!width || !height) {
      window.requestAnimationFrame(scanLoop);
      return;
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, width, height);
    const imageData = ctx.getImageData(0, 0, width, height);

    const code = jsQR(imageData.data, width, height);

    if (code && code.data) {
      handleQRCode(code.data);
      setTimeout(() => {
        if (isScanning) {
          window.requestAnimationFrame(scanLoop);
        }
      }, 1500);
    } else {
      window.requestAnimationFrame(scanLoop);
    }
  };

  const handleQRCode = (data) => {
    if (data === lastResult) return;
    setLastResult(data);

    const parsed = parseNFeFromQR(data);
    onInvoiceRead(parsed);
  };

  return (
    <section className="card">
      <header className="card-header">
        <h2>Escanear nota fiscal</h2>
        <p className="card-subtitle">
          Aponte a câmera para o QR-Code da NF-e ou NFC-e. Ao reconhecer, a nota
          será salva automaticamente no histórico.
        </p>
      </header>

      <div className="scanner-area">
        <div className="video-wrapper">
          <video ref={videoRef} className="video-preview" playsInline />
          <div className="scanner-frame" />
        </div>
        <canvas ref={canvasRef} className="hidden-canvas" />
      </div>

      {error && <p className="alert alert-error">{error}</p>}

      {lastResult && (
        <div className="last-result">
          <h3>Última leitura (QR bruto)</h3>
          <p className="last-result-text">{lastResult}</p>
        </div>
      )}

      <p className="scanner-tip">
        Dica: aproxime o QR até preencher o quadrado amarelo para uma leitura
        mais rápida. Evite reflexos e tremer o aparelho.
      </p>
    </section>
  );
};

export default Scanner;
