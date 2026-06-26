import { useEffect, useMemo, useRef, useState } from "react";
import {
  Stage,
  Layer,
  Rect,
  Text,
  Image as KonvaImage,
  Transformer,
  Group,
  Circle,
  RegularPolygon,
  Star,
  Line,
} from "react-konva";
import useImage from "use-image";
import {
  UploadCloud,
  Type,
  Smile,
  Grid3X3,
  Image as ImageIcon,
  Layers,
  Undo2,
  Redo2,
  ZoomIn,
  Info,
  ShoppingBag,
  Heart,
  MessageCircle,
  Sparkles,
  ShieldCheck,
  PenLine,
  PackageCheck,
  Plus,
  Minus,
  Trash2,
  MoveUp,
  MoveDown,
  Download,
  Copy,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Search,
} from "lucide-react";
import "../customizer.css";

const CUSTOM_PRICE_API = "https://the-veltrixx-backend.onrender.com/api/custom-price";

const brandModels = {
  iPhone: ["iPhone 15", "iPhone 15 Pro", "iPhone 16", "iPhone 17 Pro"],
  Samsung: ["Samsung S24 Ultra", "Samsung S24", "Samsung S23", "Samsung A55"],
  OnePlus: ["OnePlus 12", "OnePlus 11", "OnePlus Nord CE"],
  Vivo: ["Vivo V30", "Vivo V29", "Vivo Y200"],
  "Google Pixel": ["Pixel 8 Pro", "Pixel 8", "Pixel 7"],
};

const backgrounds = [
  { name: "Sunset Palm", color: "#5b1239", gradient: ["#20061a", "#9f1239", "#f97316", "#111827"] },
  { name: "Mountain Blue", color: "#1e3a8a", gradient: ["#0f172a", "#2563eb", "#93c5fd", "#172554"] },
  { name: "Tiger Gold", color: "#92400e", gradient: ["#111827", "#b45309", "#fbbf24", "#111827"] },
  { name: "Black Luxe", color: "#111111", gradient: ["#030712", "#171717", "#44403c", "#030712"] },
  { name: "Pink Cloud", color: "#f9a8d4", gradient: ["#fff1f2", "#f9a8d4", "#fb7185", "#831843"] },
  { name: "Royal Gold", color: "#b7791f", gradient: ["#111111", "#92400e", "#fbbf24", "#111111"] },
];

const professionalStickers = [
  { label: "Crown", value: "👑", category: "Trending" },
  { label: "Heart", value: "❤️", category: "Love" },
  { label: "King", value: "KING", category: "Quotes" },
  { label: "Panda", value: "🐼", category: "Animals" },
  { label: "Fire", value: "🔥", category: "Trending" },
  { label: "Sparkle", value: "✨", category: "Trending" },
  { label: "Star", value: "⭐", category: "Basic" },
  { label: "Diamond", value: "💎", category: "Luxury" },
  { label: "Love", value: "LOVE", category: "Love" },
  { label: "Dream", value: "DREAM", category: "Quotes" },
  { label: "Smile", value: "SMILE", category: "Quotes" },
  { label: "Queen", value: "QUEEN", category: "Quotes" },
];

const shapeOptions = [
  { name: "Rectangle", kind: "rect", icon: "▭" },
  { name: "Square", kind: "square", icon: "■" },
  { name: "Circle", kind: "circle", icon: "●" },
  { name: "Ellipse", kind: "ellipse", icon: "⬭" },
  { name: "Triangle", kind: "triangle", icon: "▲" },
  { name: "Right Triangle", kind: "rightTriangle", icon: "◢" },
  { name: "Pentagon", kind: "pentagon", icon: "⬟" },
  { name: "Hexagon", kind: "hexagon", icon: "⬢" },
  { name: "Star", kind: "star", icon: "★" },
  { name: "Heart", kind: "heart", icon: "♥" },
  { name: "Diamond", kind: "diamond", icon: "◆" },
  { name: "Line", kind: "line", icon: "━" },
];

const fonts = ["Poppins", "Playfair Display", "Bebas Neue", "Pacifico", "Montserrat", "Arial", "Georgia"];
const stickerCategories = ["Trending", "Love", "Nature", "Animals", "Quotes", "Luxury"];

function useTransformer(isSelected, transformerRef, nodeRef) {
  useEffect(() => {
    if (isSelected && transformerRef.current && nodeRef.current) {
      transformerRef.current.nodes([nodeRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected, transformerRef, nodeRef]);
}

function CanvasImage({ item, selected, onSelect, onChange }) {
  const [image] = useImage(item.src, "anonymous");
  const nodeRef = useRef(null);
  const transformerRef = useRef(null);
  useTransformer(selected, transformerRef, nodeRef);

  if (item.hidden) return null;

  return (
    <>
      <KonvaImage
        ref={nodeRef}
        image={image}
        x={item.x}
        y={item.y}
        width={item.width}
        height={item.height}
        rotation={item.rotation || 0}
        opacity={item.opacity ?? 1}
        draggable={!item.locked}
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e) => onChange({ ...item, x: e.target.x(), y: e.target.y() })}
        onTransformEnd={() => {
          const node = nodeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...item,
            x: node.x(),
            y: node.y(),
            width: Math.max(35, node.width() * scaleX),
            height: Math.max(35, node.height() * scaleY),
            rotation: node.rotation(),
          });
        }}
      />
      {selected && !item.locked && (
        <Transformer ref={transformerRef} rotateEnabled borderStroke="#d79b2b" anchorFill="#fff" anchorStroke="#d79b2b" anchorSize={10} />
      )}
    </>
  );
}

function CanvasText({ item, selected, onSelect, onChange }) {
  const nodeRef = useRef(null);
  const transformerRef = useRef(null);
  useTransformer(selected, transformerRef, nodeRef);

  if (item.hidden) return null;

  return (
    <>
      <Text
        ref={nodeRef}
        text={item.text}
        x={item.x}
        y={item.y}
        width={item.width}
        fontSize={item.fontSize}
        fontFamily={item.fontFamily}
        fill={item.fill}
        fontStyle={item.bold ? "bold" : "normal"}
        textDecoration={item.underline ? "underline" : ""}
        opacity={item.opacity ?? 1}
        shadowColor={item.shadow ? "rgba(0,0,0,.65)" : "transparent"}
        shadowBlur={item.shadow ? 12 : 0}
        shadowOffsetY={item.shadow ? 4 : 0}
        rotation={item.rotation || 0}
        align="center"
        draggable={!item.locked}
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e) => onChange({ ...item, x: e.target.x(), y: e.target.y() })}
        onTransformEnd={() => {
          const node = nodeRef.current;
          const scaleX = node.scaleX();
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...item,
            x: node.x(),
            y: node.y(),
            width: Math.max(35, node.width() * scaleX),
            fontSize: Math.max(12, item.fontSize * scaleX),
            rotation: node.rotation(),
          });
        }}
      />
      {selected && !item.locked && (
        <Transformer ref={transformerRef} rotateEnabled borderStroke="#d79b2b" anchorFill="#fff" anchorStroke="#d79b2b" anchorSize={10} />
      )}
    </>
  );
}

function CanvasShape({ item, selected, onSelect, onChange }) {
  const nodeRef = useRef(null);
  const transformerRef = useRef(null);
  useTransformer(selected, transformerRef, nodeRef);

  if (item.hidden) return null;

  const commonProps = {
    ref: nodeRef,
    x: item.x,
    y: item.y,
    fill: item.fill,
    stroke: item.stroke,
    strokeWidth: 2,
    opacity: item.opacity ?? 1,
    rotation: item.rotation || 0,
    draggable: !item.locked,
    onClick: onSelect,
    onTap: onSelect,
    onDragEnd: (e) => onChange({ ...item, x: e.target.x(), y: e.target.y() }),
    onTransformEnd: () => {
      const node = nodeRef.current;
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();
      node.scaleX(1);
      node.scaleY(1);
      onChange({
        ...item,
        x: node.x(),
        y: node.y(),
        width: Math.max(25, (item.width || 80) * scaleX),
        height: Math.max(25, (item.height || 80) * scaleY),
        radius: Math.max(15, (item.radius || 45) * Math.max(scaleX, scaleY)),
        rotation: node.rotation(),
      });
    },
  };

  let shape = null;

  if (item.kind === "circle") {
    shape = <Circle {...commonProps} radius={item.radius || 45} />;
  } else if (item.kind === "ellipse") {
    shape = <Circle {...commonProps} radius={item.radius || 45} scaleX={1.35} scaleY={0.75} />;
  } else if (item.kind === "triangle") {
    shape = <RegularPolygon {...commonProps} sides={3} radius={item.radius || 55} />;
  } else if (item.kind === "pentagon") {
    shape = <RegularPolygon {...commonProps} sides={5} radius={item.radius || 50} />;
  } else if (item.kind === "hexagon") {
    shape = <RegularPolygon {...commonProps} sides={6} radius={item.radius || 50} />;
  } else if (item.kind === "star") {
    shape = <Star {...commonProps} numPoints={5} innerRadius={22} outerRadius={52} />;
  } else if (item.kind === "line") {
    shape = <Line {...commonProps} points={[0, 0, 150, 0]} stroke={item.stroke || item.fill} strokeWidth={5} />;
  } else if (item.kind === "heart") {
    shape = (
      <Text
        {...commonProps}
        text="♥"
        width={100}
        fontSize={80}
        fontFamily="Arial"
        align="center"
      />
    );
  } else if (item.kind === "diamond") {
    shape = <RegularPolygon {...commonProps} sides={4} radius={item.radius || 52} rotation={(item.rotation || 0) + 45} />;
  } else if (item.kind === "rightTriangle") {
    shape = <Line {...commonProps} points={[0, 90, 90, 90, 90, 0]} closed fill={item.fill} stroke={item.stroke} strokeWidth={2} />;
  } else {
    shape = (
      <Rect
        {...commonProps}
        width={item.width || 110}
        height={item.height || 75}
        cornerRadius={item.kind === "square" ? 4 : item.cornerRadius || 12}
      />
    );
  }

  return (
    <>
      {shape}
      {selected && !item.locked && (
        <Transformer ref={transformerRef} rotateEnabled borderStroke="#d79b2b" anchorFill="#fff" anchorStroke="#d79b2b" anchorSize={10} />
      )}
    </>
  );
}

function CustomizeCase({ addToCart }) {
  const fileInputRef = useRef(null);
  const stickerInputRef = useRef(null);
  const stageRef = useRef(null);

  const [brand, setBrand] = useState("iPhone");
  const [model, setModel] = useState("iPhone 15 Pro");
  const [caseType, setCaseType] = useState("Hard Case");
  const [finish, setFinish] = useState("Glossy");
  const [background, setBackground] = useState(backgrounds[0]);
  const [activeTool, setActiveTool] = useState("upload");
  const [selectedId, setSelectedId] = useState("text-main");
  const [zoom, setZoom] = useState(100);
  const [qty, setQty] = useState(1);
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [stickerTab, setStickerTab] = useState("Professional");
  const [stickerSearch, setStickerSearch] = useState("");
  const [stickerCategory, setStickerCategory] = useState("Trending");
  const [myStickers, setMyStickers] = useState([]);
  const [shapeTab, setShapeTab] = useState("Basic");
  const [currentStep, setCurrentStep] = useState("design");
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  const [priceConfig, setPriceConfig] = useState({
    basePrice: 499,
    imageUploadCharge: 50,
    caseTypePrices: {
      hardCase: 0,
      siliconeCase: 80,
      toughCase: 140,
    },
    finishPrices: {
      glossy: 0,
      matte: 60,
      frosted: 90,
    },
  });

  const [elements, setElements] = useState([
    {
      id: "shadow-box",
      type: "shape",
      kind: "rect",
      x: 40,
      y: 232,
      width: 200,
      height: 90,
      fill: "rgba(0,0,0,.24)",
      stroke: "rgba(255,255,255,.14)",
      cornerRadius: 14,
      opacity: 1,
      name: "Background Highlight",
    },
    {
      id: "text-main",
      type: "text",
      text: "Explore",
      x: 36,
      y: 230,
      width: 210,
      fontSize: 48,
      fontFamily: "Pacifico",
      fill: "#ffffff",
      bold: true,
      shadow: true,
      name: "Explore Text",
    },
    {
      id: "text-sub",
      type: "text",
      text: "THE WORLD",
      x: 72,
      y: 292,
      width: 150,
      fontSize: 15,
      fontFamily: "Montserrat",
      fill: "#ffffff",
      bold: true,
      shadow: true,
      name: "Subtitle Text",
    },
    {
      id: "sticker-crown",
      type: "sticker",
      text: "👑",
      x: 112,
      y: 178,
      width: 70,
      fontSize: 38,
      fontFamily: "Arial",
      fill: "#ffffff",
      bold: true,
      name: "Crown Sticker",
    },
  ]);

  const selected = elements.find((item) => item.id === selectedId);
  const selectedCanStyle = selected && (selected.type === "text" || selected.type === "sticker");

  useEffect(() => {
    const fetchCustomPrice = async () => {
      try {
        const res = await fetch(CUSTOM_PRICE_API);
        const data = await res.json();

        if (data.success && data.price) {
          setPriceConfig({
            basePrice: Number(data.price.basePrice ?? 499),
            imageUploadCharge: Number(data.price.imageUploadCharge ?? 50),
            caseTypePrices: {
              hardCase: Number(data.price.caseTypePrices?.hardCase ?? 0),
              siliconeCase: Number(data.price.caseTypePrices?.siliconeCase ?? 80),
              toughCase: Number(data.price.caseTypePrices?.toughCase ?? 140),
            },
            finishPrices: {
              glossy: Number(data.price.finishPrices?.glossy ?? 0),
              matte: Number(data.price.finishPrices?.matte ?? 60),
              frosted: Number(data.price.finishPrices?.frosted ?? 90),
            },
          });
        }
      } catch (error) {
        console.log("Custom price fetch failed:", error);
      }
    };

    fetchCustomPrice();
  }, []);

  const price = useMemo(() => {
    let amount = Number(priceConfig.basePrice || 499);

    if (caseType === "Hard Case") {
      amount += Number(priceConfig.caseTypePrices?.hardCase || 0);
    }

    if (caseType === "Silicone Case") {
      amount += Number(priceConfig.caseTypePrices?.siliconeCase || 0);
    }

    if (caseType === "Tough Case") {
      amount += Number(priceConfig.caseTypePrices?.toughCase || 0);
    }

    if (finish === "Glossy") {
      amount += Number(priceConfig.finishPrices?.glossy || 0);
    }

    if (finish === "Matte") {
      amount += Number(priceConfig.finishPrices?.matte || 0);
    }

    if (finish === "Frosted") {
      amount += Number(priceConfig.finishPrices?.frosted || 0);
    }

    if (elements.some((item) => item.type === "image")) {
      amount += Number(priceConfig.imageUploadCharge || 0);
    }

    return amount;
  }, [caseType, finish, elements, priceConfig]);

  const total = price * qty;

  const filteredStickers = professionalStickers.filter((item) => {
    const matchesSearch =
      item.label.toLowerCase().includes(stickerSearch.toLowerCase()) ||
      item.value.toLowerCase().includes(stickerSearch.toLowerCase());

    const matchesCategory = stickerCategory === "All" || item.category === stickerCategory;
    return matchesSearch && matchesCategory;
  });

  const commit = (nextElements) => {
    setHistory((prev) => [...prev, elements]);
    setRedoStack([]);
    setElements(nextElements);
  };

  const updateElement = (id, nextItem) => {
    commit(elements.map((item) => (item.id === id ? nextItem : item)));
  };

  const addText = (text = "New Text", fontSize = 30) => {
    const id = `text-${Date.now()}`;
    commit([
      ...elements,
      {
        id,
        type: "text",
        text,
        x: 55,
        y: 235,
        width: 180,
        fontSize,
        fontFamily: "Poppins",
        fill: "#ffffff",
        bold: true,
        shadow: true,
        opacity: 1,
        name: `${text} Text`,
      },
    ]);
    setSelectedId(id);
    setActiveTool("text");
  };

  const addSticker = (sticker, label = "Sticker") => {
    const id = `sticker-${Date.now()}`;
    commit([
      ...elements,
      {
        id,
        type: "sticker",
        text: sticker,
        x: 110,
        y: 170,
        width: sticker.length > 2 ? 110 : 70,
        fontSize: sticker.length > 2 ? 25 : 40,
        fontFamily: "Arial",
        fill: "#ffffff",
        bold: true,
        shadow: true,
        opacity: 1,
        name: label,
      },
    ]);
    setSelectedId(id);
    setActiveTool("stickers");
  };

  const addShape = (kind = "rect", name = "Rectangle") => {
    const id = `shape-${Date.now()}`;
    const size =
      kind === "square"
        ? { width: 90, height: 90 }
        : kind === "line"
        ? { width: 150, height: 5 }
        : { width: 130, height: 82 };

    commit([
      ...elements,
      {
        id,
        type: "shape",
        kind,
        x: 80,
        y: 245,
        radius: 48,
        ...size,
        fill: kind === "line" ? "transparent" : "rgba(255,255,255,.30)",
        stroke: "#ffffff",
        opacity: 1,
        name,
      },
    ]);
    setSelectedId(id);
  };

  const handleImageFile = (file, type = "image") => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    const src = URL.createObjectURL(file);

    if (type === "stickerUpload") {
      const customSticker = {
        id: `my-sticker-${Date.now()}`,
        label: file.name.replace(/\.[^/.]+$/, ""),
        src,
      };
      setMyStickers((prev) => [customSticker, ...prev]);
      addImageToCanvas(src, customSticker.label, "image");
      return;
    }

    addImageToCanvas(src, file.name.replace(/\.[^/.]+$/, ""), "image");
  };

  const addImageToCanvas = (src, name = "Image", type = "image") => {
    const id = `${type}-${Date.now()}`;
    commit([
      ...elements,
      {
        id,
        type: "image",
        src,
        x: 24,
        y: 145,
        width: type === "sticker" ? 110 : 232,
        height: type === "sticker" ? 110 : 300,
        opacity: 1,
        name,
      },
    ]);
    setSelectedId(id);
    setActiveTool(type === "sticker" ? "stickers" : "images");
  };

  const uploadImage = (event) => {
    handleImageFile(event.target.files?.[0], "image");
    event.target.value = "";
  };

  const uploadSticker = (event) => {
    handleImageFile(event.target.files?.[0], "stickerUpload");
    event.target.value = "";
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragOver(false);
    handleImageFile(event.dataTransfer.files?.[0], "image");
  };

  const duplicateSelected = () => {
    if (!selected) return;
    const id = `${selected.type}-${Date.now()}`;
    commit([...elements, { ...selected, id, x: selected.x + 18, y: selected.y + 18, name: `${selected.name || selected.type} Copy` }]);
    setSelectedId(id);
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    commit(elements.filter((item) => item.id !== selectedId));
    setSelectedId(null);
  };

  const bringForward = () => {
    const index = elements.findIndex((item) => item.id === selectedId);
    if (index < 0 || index === elements.length - 1) return;
    const next = [...elements];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    commit(next);
  };

  const sendBackward = () => {
    const index = elements.findIndex((item) => item.id === selectedId);
    if (index <= 0) return;
    const next = [...elements];
    [next[index], next[index - 1]] = [next[index - 1], next[index]];
    commit(next);
  };

  const bringToFront = () => {
    if (!selected) return;
    commit([...elements.filter((item) => item.id !== selectedId), selected]);
  };

  const sendToBack = () => {
    if (!selected) return;
    commit([selected, ...elements.filter((item) => item.id !== selectedId)]);
  };

  const toggleHidden = (id) => {
    const item = elements.find((el) => el.id === id);
    if (!item) return;
    updateElement(id, { ...item, hidden: !item.hidden });
  };

  const toggleLocked = (id) => {
    const item = elements.find((el) => el.id === id);
    if (!item) return;
    updateElement(id, { ...item, locked: !item.locked });
  };

  const clearAllLayers = () => {
    if (!window.confirm("Clear all layers?")) return;
    commit([]);
    setSelectedId(null);
  };

  const undo = () => {
    if (!history.length) return;
    const previous = history[history.length - 1];
    setRedoStack((prev) => [...prev, elements]);
    setElements(previous);
    setHistory((prev) => prev.slice(0, -1));
    setSelectedId(null);
  };

  const redo = () => {
    if (!redoStack.length) return;
    const next = redoStack[redoStack.length - 1];
    setHistory((prev) => [...prev, elements]);
    setElements(next);
    setRedoStack((prev) => prev.slice(0, -1));
    setSelectedId(null);
  };

  const resetCanvas = () => {
    if (!window.confirm("Reset this design?")) return;
    commit([]);
    setSelectedId(null);
  };

  const exportDesign = () => {
    setSelectedId(null);
    setTimeout(() => {
      const uri = stageRef.current.toDataURL({ pixelRatio: 3 });
      const link = document.createElement("a");
      link.download = "the-veltrixx-custom-case.png";
      link.href = uri;
      link.click();
    }, 80);
  };

  const openPreview = () => {
    setSelectedId(null);
    setTimeout(() => {
      const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
      setPreviewImage(uri);
      setCurrentStep("preview");
    }, 80);
  };

  const goToCartStep = () => {
    setCurrentStep("cart");
    addCustomToCart();
  };

  const getPreview = () => {
    setSelectedId(null);
    return stageRef.current.toDataURL({ pixelRatio: 2 });
  };

  const saveDesign = () => {
    const design = {
      id: Date.now(),
      brand,
      model,
      caseType,
      finish,
      background,
      elements,
      price,
      preview: getPreview(),
    };

    const saved = JSON.parse(localStorage.getItem("veltrixx_saved_designs")) || [];
    localStorage.setItem("veltrixx_saved_designs", JSON.stringify([design, ...saved]));
    alert("Design saved successfully");
  };

  const addCustomToCart = () => {
    const preview = getPreview();

    const product = {
      id: `custom-case-${Date.now()}`,
      _id: `custom-case-${Date.now()}`,
      name: `Custom ${brand} Case`,
      brand,
      model,
      selectedModel: model,
      selectedColor: "Custom Design",
      price,
      qty,
      image: preview,
      selectedImage: preview,
      isCustomCase: true,
      customDesign: {
        brand,
        model,
        caseType,
        finish,
        background,
        elements,
        priceConfig,
      },
    };

    if (addToCart) addToCart(product);
    else {
      const old = JSON.parse(localStorage.getItem("veltrixx_cart")) || [];
      localStorage.setItem("veltrixx_cart", JSON.stringify([...old, product]));
      alert("Custom case added to cart");
    }
  };

  const orderOnWhatsApp = () => {
    const message = `Hello THE VELTRIXX,%0A%0AI want to order a custom case.%0ABrand: ${brand}%0AModel: ${model}%0ACase Type: ${caseType}%0AFinish: ${finish}%0AQuantity: ${qty}%0ATotal: ₹${total}`;
    window.open(`https://wa.me/919899723391?text=${message}`, "_blank");
  };

  return (
    <div className="velStudioPage">
      <div className="studioStepHeader">
        <div className="studioCrumbs">
          <span>Home</span>
          <b>›</b>
          <span>Customize Case</span>
        </div>

        <div className="studioSteps">
          <button
            type="button"
            className={currentStep === "design" ? "activeStudioStep" : ""}
            onClick={() => setCurrentStep("design")}
          >
            1 Design
          </button>
          <i></i>
          <button
            type="button"
            className={currentStep === "preview" ? "activeStudioStep" : ""}
            onClick={openPreview}
          >
            2 Preview
          </button>
          <i></i>
          <button
            type="button"
            className={currentStep === "cart" ? "activeStudioStep" : ""}
            onClick={goToCartStep}
          >
            3 Add to Cart
          </button>
        </div>

        <button className="howItWorksBtn" type="button" onClick={() => setShowHowItWorks(true)}>
          ▷ How It Works?
        </button>
      </div>

      {currentStep === "preview" && (
        <section className="customPreviewSection">
          <div className="previewCardLarge">
            <div>
              <span>LIVE PREVIEW</span>
              <h2>Your Custom Case Preview</h2>
              <p>Check your final design before adding it to cart.</p>
            </div>

            <div className="previewImageFrame">
              {previewImage ? (
                <img src={previewImage} alt="Custom case preview" />
              ) : (
                <p>Click Preview again to generate image.</p>
              )}
            </div>

            <div className="previewActions">
              <button type="button" onClick={() => setCurrentStep("design")}>Edit Design</button>
              <button type="button" onClick={exportDesign}>Download Preview</button>
              <button type="button" className="goldPreviewBtn" onClick={goToCartStep}>Add To Cart</button>
            </div>
          </div>
        </section>
      )}

      <div className="velStudioGrid">
        <aside className="studioLeftPanel">
          <div className="studioPanelTitle">
            <Sparkles size={18} />
            <h2>Add Elements</h2>
          </div>

          <div className="studioLeftBody">
            <div className="studioIconRail">
              <button className={activeTool === "upload" ? "activeStudioTool" : ""} onClick={() => setActiveTool("upload")}><UploadCloud size={22} /><span>Upload</span></button>
              <button className={activeTool === "text" ? "activeStudioTool" : ""} onClick={() => setActiveTool("text")}><Type size={22} /><span>Text</span></button>
              <button className={activeTool === "stickers" ? "activeStudioTool" : ""} onClick={() => setActiveTool("stickers")}><Smile size={22} /><span>Stickers</span></button>
              <button className={activeTool === "shapes" ? "activeStudioTool" : ""} onClick={() => setActiveTool("shapes")}><Grid3X3 size={22} /><span>Shapes</span></button>
              <button className={activeTool === "background" ? "activeStudioTool" : ""} onClick={() => setActiveTool("background")}><ImageIcon size={22} /><span>Background</span></button>
              <button className={activeTool === "layers" ? "activeStudioTool" : ""} onClick={() => setActiveTool("layers")}><Layers size={22} /><span>Layers</span></button>
            </div>

            <div className="studioToolContent">
              {(activeTool === "upload" || activeTool === "images") && (
                <>
                  <h3>Upload Image</h3>
                  <button
                    className={dragOver ? "studioUploadArea dragActiveUpload" : "studioUploadArea"}
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                  >
                    <UploadCloud size={33} />
                    <b>Drag & Drop or Click to Upload</b>
                    <span>PNG, JPG, JPEG up to 5MB</span>
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={uploadImage} />

                  <div className="studioSectionHead">
                    <h3>Recent Uploads</h3>
                    <button type="button">View All</button>
                  </div>

                  <div className="recentDesignGrid">
                    {backgrounds.slice(0, 4).map((item) => (
                      <button key={item.name} type="button" style={{ background: item.color }} onClick={() => setBackground(item)} />
                    ))}
                  </div>
                </>
              )}

              {(activeTool === "text" || activeTool === "upload") && (
                <>
                  <div className="studioSectionHead">
                    <h3>Add Text</h3>
                  </div>

                  <input
                    className="studioTextInput"
                    value={selectedCanStyle ? selected.text : ""}
                    placeholder="Enter your text"
                    onChange={(e) => selectedCanStyle && updateElement(selected.id, { ...selected, text: e.target.value })}
                  />

                  <div className="textMiniControls">
                    <select
                      value={selected?.fontFamily || "Poppins"}
                      onChange={(e) => selectedCanStyle && updateElement(selected.id, { ...selected, fontFamily: e.target.value })}
                    >
                      {fonts.map((font) => <option key={font}>{font}</option>)}
                    </select>
                    <input
                      type="color"
                      value={selected?.fill || "#ffffff"}
                      onChange={(e) => selectedCanStyle && updateElement(selected.id, { ...selected, fill: e.target.value })}
                    />
                    <button onClick={() => selectedCanStyle && updateElement(selected.id, { ...selected, bold: !selected.bold })}>B</button>
                    <button onClick={() => selectedCanStyle && updateElement(selected.id, { ...selected, underline: !selected.underline })}>U</button>
                  </div>

                  <div className="fontPreviewGrid">
                    {fonts.slice(0, 4).map((font) => (
                      <button key={font} style={{ fontFamily: font }} onClick={() => addText(font, 28)}>
                        Abc <small>{font}</small>
                      </button>
                    ))}
                  </div>

                  <button className="addTextBtn" type="button" onClick={() => addText("Your Text", 32)}>+ Add Text</button>
                </>
              )}

              {activeTool === "stickers" && (
                <div className="professionalStickerPanel">
                  <div className="studioSectionHead">
                    <div>
                      <h3>Stickers</h3>
                      <p>Add professional stickers to your design</p>
                    </div>
                    <button type="button">View All</button>
                  </div>

                  <div className="stickerTabs">
                    {["Professional", "My Stickers", "Upload"].map((tab) => (
                      <button key={tab} className={stickerTab === tab ? "activeStickerTab" : ""} onClick={() => setStickerTab(tab)}>
                        {tab}
                      </button>
                    ))}
                  </div>

                  {stickerTab === "Professional" && (
                    <>
                      <div className="stickerSearchBox">
                        <Search size={16} />
                        <input placeholder="Search professional stickers..." value={stickerSearch} onChange={(e) => setStickerSearch(e.target.value)} />
                      </div>

                      <div className="stickerCategoryRow">
                        <button className={stickerCategory === "All" ? "activeStickerCategory" : ""} onClick={() => setStickerCategory("All")}>All</button>
                        {stickerCategories.map((cat) => (
                          <button key={cat} className={stickerCategory === cat ? "activeStickerCategory" : ""} onClick={() => setStickerCategory(cat)}>
                            {cat}
                          </button>
                        ))}
                      </div>

                      <div className="studioStickerGrid premiumStickerGrid">
                        {filteredStickers.map((item) => (
                          <button key={item.label} type="button" onClick={() => addSticker(item.value, item.label)}>
                            <b>{item.value}</b>
                            <span>{item.label}</span>
                          </button>
                        ))}
                      </div>

                      <div className="stickerCategoryCards">
                        <div><b>💗 Love</b><span>45 Stickers</span></div>
                        <div><b>🌿 Nature</b><span>62 Stickers</span></div>
                        <div><b>🐼 Animals</b><span>48 Stickers</span></div>
                        <div><b>❝ Quotes</b><span>35 Stickers</span></div>
                      </div>
                    </>
                  )}

                  {stickerTab === "My Stickers" && (
                    <>
                      {myStickers.length === 0 ? (
                        <div className="emptyStickerState">No custom stickers yet. Upload your own sticker.</div>
                      ) : (
                        <div className="myStickerGrid">
                          {myStickers.map((item) => (
                            <button key={item.id} type="button" onClick={() => addImageToCanvas(item.src, item.label, "sticker")}>
                              <img src={item.src} alt={item.label} />
                              <span>{item.label}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {stickerTab === "Upload" && (
                    <button className="uploadStickerBox" type="button" onClick={() => stickerInputRef.current.click()}>
                      <UploadCloud size={32} />
                      <b>Upload Your Own Sticker</b>
                      <span>PNG, JPG, WEBP up to 5MB</span>
                    </button>
                  )}

                  <input ref={stickerInputRef} type="file" accept="image/*" hidden onChange={uploadSticker} />

                  <div className="studioTipBox">💡 Tip: Select sticker after adding to drag, resize or rotate it.</div>
                </div>
              )}

              {activeTool === "shapes" && (
                <div className="professionalShapesPanel">
                  <div className="studioSectionHead">
                    <div>
                      <h3>Shapes</h3>
                      <p>Add shapes to your design</p>
                    </div>
                  </div>

                  <div className="shapeTabs">
                    {["Basic", "Arrows", "Frames", "Line"].map((tab) => (
                      <button key={tab} className={shapeTab === tab ? "activeShapeTab" : ""} onClick={() => setShapeTab(tab)}>
                        {tab}
                      </button>
                    ))}
                  </div>

                  <h3>Basic Shapes</h3>
                  <div className="professionalShapeGrid">
                    {shapeOptions.map((item) => (
                      <button key={item.kind} type="button" onClick={() => addShape(item.kind, item.name)}>
                        <b>{item.icon}</b>
                        <span>{item.name}</span>
                      </button>
                    ))}
                  </div>

                  <h3>Custom Shapes</h3>
                  <button className="uploadStickerBox" type="button" onClick={() => addShape("rect", "Rounded Shape")}>
                    + Add Rounded Shape
                  </button>

                  <div className="recentShapesRow">
                    <span style={{ background: "#c4b5fd" }}></span>
                    <span style={{ background: "#f9a8d4", borderRadius: 8 }}></span>
                    <span style={{ background: "#86efac", clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)" }}></span>
                    <span style={{ background: "#7dd3fc", clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}></span>
                  </div>
                  <div className="studioTipBox">💡 Tip: Click any shape to add it, then drag/resize/rotate on case.</div>
                </div>
              )}

              {activeTool === "background" && (
                <>
                  <h3>Background</h3>
                  <div className="recentDesignGrid">
                    {backgrounds.map((item) => (
                      <button key={item.name} type="button" style={{ background: item.color }} onClick={() => setBackground(item)} />
                    ))}
                  </div>
                </>
              )}

              {activeTool === "layers" && (
                <div className="professionalLayersPanel">
                  <div className="studioSectionHead">
                    <div>
                      <h3>Layers</h3>
                      <p>Manage your design layers</p>
                    </div>
                    <button type="button" onClick={clearAllLayers}>Clear All</button>
                  </div>

                  <div className="layerCountBox">
                    <b>Total Layers: {elements.length}</b>
                  </div>

                  <div className="professionalLayerList">
                    {[...elements].reverse().map((item) => (
                      <button className={selectedId === item.id ? "activeProfessionalLayer" : ""} key={item.id} onClick={() => setSelectedId(item.id)}>
                        <span className="dragDots">⋮⋮</span>
                        <span className="layerTypeIcon">{item.type === "text" ? "T" : item.type === "image" ? "▧" : item.type === "shape" ? "□" : "👑"}</span>
                        <span className="layerName"><b>{item.name || item.text || item.type}</b><small>{item.type}</small></span>
                        <span onClick={(e) => { e.stopPropagation(); toggleHidden(item.id); }}>{item.hidden ? <EyeOff size={15} /> : <Eye size={15} />}</span>
                        <span onClick={(e) => { e.stopPropagation(); toggleLocked(item.id); }}>{item.locked ? <Lock size={15} /> : <Unlock size={15} />}</span>
                      </button>
                    ))}
                  </div>

                  <h3>Layer Actions</h3>
                  <div className="layerActionGrid">
                    <button onClick={bringToFront}>↑ Bring To Front</button>
                    <button onClick={bringForward}>↑ Bring Forward</button>
                    <button onClick={sendBackward}>↓ Send Backward</button>
                    <button onClick={sendToBack}>↓ Send To Back</button>
                    <button className="deleteLayerWide" onClick={deleteSelected}><Trash2 size={15} /> Delete Layer</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>

        <main className="studioCanvasPanel">
          <div className="studioBrandTabs">
            {Object.keys(brandModels).slice(0, 5).map((item) => (
              <button key={item} className={brand === item ? "activeBrandStudio" : ""} onClick={() => { setBrand(item); setModel(brandModels[item][0]); }}>
                {item}
              </button>
            ))}
          </div>

          <div className="studioWorkspace">
            <aside className="floatingLayersBox">
              <h3>Layers</h3>
              {[...elements].reverse().slice(0, 5).map((item) => (
                <button key={item.id} onClick={() => setSelectedId(item.id)} className={selectedId === item.id ? "activeFloatingLayer" : ""}>
                  <span>{item.type === "text" ? "T" : item.type === "image" ? "▧" : item.type === "shape" ? "□" : "✦"}</span>
                  {item.name || item.text || item.type}
                  {item.hidden ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              ))}
              <div className="layerActionRow">
                <button onClick={bringForward}>↑</button>
                <button onClick={sendBackward}>↓</button>
                <button onClick={duplicateSelected}><Copy size={14} /></button>
                <button onClick={deleteSelected}><Trash2 size={14} /></button>
              </div>
            </aside>

            <div className="phoneCanvasStage" style={{ transform: `scale(${zoom / 100})` }}>
              <Stage
                width={320}
                height={590}
                ref={stageRef}
                onMouseDown={(e) => { if (e.target === e.target.getStage()) setSelectedId(null); }}
                onTouchStart={(e) => { if (e.target === e.target.getStage()) setSelectedId(null); }}
              >
                <Layer>
                  <Group
                    x={18}
                    y={16}
                    clipFunc={(ctx) => {
                      ctx.beginPath();
                      ctx.moveTo(52, 0);
                      ctx.lineTo(232, 0);
                      ctx.quadraticCurveTo(282, 0, 282, 52);
                      ctx.lineTo(282, 492);
                      ctx.quadraticCurveTo(282, 544, 232, 544);
                      ctx.lineTo(52, 544);
                      ctx.quadraticCurveTo(0, 544, 0, 492);
                      ctx.lineTo(0, 52);
                      ctx.quadraticCurveTo(0, 0, 52, 0);
                      ctx.closePath();
                    }}
                  >
                    <Rect width={282} height={544} fill={background.color} />
                    <Rect
                      width={282}
                      height={544}
                      fillLinearGradientStartPoint={{ x: 0, y: 0 }}
                      fillLinearGradientEndPoint={{ x: 282, y: 544 }}
                      fillLinearGradientColorStops={[0, background.gradient?.[0] || background.color, 0.35, background.gradient?.[1] || background.color, 0.7, background.gradient?.[2] || background.color, 1, background.gradient?.[3] || background.color]}
                    />

                    {elements.map((item) => {
                      if (item.type === "image") {
                        return <CanvasImage key={item.id} item={item} selected={selectedId === item.id} onSelect={() => setSelectedId(item.id)} onChange={(next) => updateElement(item.id, next)} />;
                      }
                      if (item.type === "text" || item.type === "sticker") {
                        return <CanvasText key={item.id} item={item} selected={selectedId === item.id} onSelect={() => setSelectedId(item.id)} onChange={(next) => updateElement(item.id, next)} />;
                      }
                      if (item.type === "shape") {
                        return <CanvasShape key={item.id} item={item} selected={selectedId === item.id} onSelect={() => setSelectedId(item.id)} onChange={(next) => updateElement(item.id, next)} />;
                      }
                      return null;
                    })}

                    <Rect x={18} y={18} width={92} height={110} fill="rgba(0,0,0,.55)" cornerRadius={26} />
                    <Circle x={48} y={52} radius={15} fill="#020617" stroke="#888" strokeWidth={3} />
                    <Circle x={82} y={52} radius={15} fill="#020617" stroke="#888" strokeWidth={3} />
                    <Circle x={48} y={89} radius={15} fill="#020617" stroke="#888" strokeWidth={3} />
                  </Group>

                  <Rect x={18} y={16} width={282} height={544} cornerRadius={56} stroke="#111" strokeWidth={12} listening={false} />
                </Layer>
              </Stage>
            </div>

            <div className="floatingToolRail">
              <button onClick={undo} disabled={!history.length}><Undo2 size={18} />Undo</button>
              <button onClick={redo} disabled={!redoStack.length}><Redo2 size={18} />Redo</button>
              <button onClick={bringForward} disabled={!selected}><MoveUp size={18} />Layer</button>
              <button onClick={sendBackward} disabled={!selected}><MoveDown size={18} />Back</button>
              <button><ZoomIn size={18} />Zoom</button>
              <button><Info size={18} />Info</button>
            </div>
          </div>

          {selected && (
            <div className="selectedEditPanel">
              <div>
                <b>{selected.type.toUpperCase()}</b>
                <span>Edit selected layer</span>
              </div>

              {selectedCanStyle && (
                <>
                  <input value={selected.text} onChange={(e) => updateElement(selected.id, { ...selected, text: e.target.value })} />
                  <select value={selected.fontFamily || "Poppins"} onChange={(e) => updateElement(selected.id, { ...selected, fontFamily: e.target.value })}>
                    {fonts.map((font) => <option key={font}>{font}</option>)}
                  </select>
                  <input type="color" value={selected.fill || "#ffffff"} onChange={(e) => updateElement(selected.id, { ...selected, fill: e.target.value })} />
                </>
              )}

              {selected?.type === "shape" && (
                <>
                  <input type="color" value={selected.fill?.startsWith("#") ? selected.fill : "#ffffff"} onChange={(e) => updateElement(selected.id, { ...selected, fill: e.target.value })} />
                  <input type="color" value={selected.stroke || "#ffffff"} onChange={(e) => updateElement(selected.id, { ...selected, stroke: e.target.value })} />
                </>
              )}

              <label>Opacity</label>
              <input type="range" min="0.1" max="1" step="0.1" value={selected.opacity ?? 1} onChange={(e) => updateElement(selected.id, { ...selected, opacity: Number(e.target.value) })} />
              <label>Rotate</label>
              <input type="range" min="-180" max="180" value={selected.rotation || 0} onChange={(e) => updateElement(selected.id, { ...selected, rotation: Number(e.target.value) })} />

              <button type="button" onClick={duplicateSelected}>Duplicate</button>
              <button type="button" onClick={deleteSelected} className="deleteSelectedLayerBtn">Delete</button>
            </div>
          )}

          <div className="studioZoomBar">
            <button onClick={() => setZoom(Math.max(70, zoom - 10))}>−</button>
            <b>{zoom}%</b>
            <button onClick={() => setZoom(Math.min(130, zoom + 10))}>+</button>
            <button onClick={() => setZoom(100)}>Fit to Screen</button>
            <button onClick={exportDesign}><Download size={15} /> Download</button>
            <button onClick={resetCanvas}>Reset</button>
          </div>

          <p className="studioTipText">💡 Tip: Select any item on the case to drag, resize, rotate, edit, duplicate or delete it.</p>
        </main>

        <aside className="studioSummaryPanel">
          <div className="summaryTitleBar">
            <Sparkles size={18} />
            <h2>Your Custom Case</h2>
          </div>

          <div className="summaryPriceRow">
            <b>₹{price}</b>
            <span>Inclusive of all taxes</span>
          </div>

          <div className="summaryInfoRows">
            <p><span>Brand</span><b>{brand}</b></p>
            <p><span>Model</span><b>{model}</b></p>
            <p><span>Case Type</span><b>{caseType}</b></p>
            <p><span>Finish</span><b>{finish}</b></p>
          </div>

          <label>Model</label>
          <select value={model} onChange={(e) => setModel(e.target.value)}>
            {brandModels[brand].map((item) => <option key={item}>{item}</option>)}
          </select>

          <label>Case Type</label>
          <div className="optionChipGrid">
            {["Hard Case", "Silicone Case", "Tough Case"].map((item) => (
              <button key={item} className={caseType === item ? "activeOptionChip" : ""} onClick={() => setCaseType(item)}>{item}</button>
            ))}
          </div>

          <label>Finish</label>
          <div className="optionChipGrid">
            {["Glossy", "Matte", "Frosted"].map((item) => (
              <button key={item} className={finish === item ? "activeOptionChip" : ""} onClick={() => setFinish(item)}>{item}</button>
            ))}
          </div>

          <div className="qtySummary">
            <span>Quantity</span>
            <div>
              <button onClick={() => setQty(Math.max(1, qty - 1))}><Minus size={14} /></button>
              <b>{qty}</b>
              <button onClick={() => setQty(qty + 1)}><Plus size={14} /></button>
            </div>
          </div>

          <div className="totalSummary">
            <span>Total</span>
            <b>₹{total}</b>
          </div>

          <button className="addCartGoldBtn" onClick={addCustomToCart}><ShoppingBag size={18} /> Add to Cart</button>
          <button className="saveDesignBtn" onClick={saveDesign}><Heart size={18} /> Save Design</button>
          <button className="whatsappOrderBtn" onClick={orderOnWhatsApp}><MessageCircle size={18} /> Order on WhatsApp</button>

          <div className="summaryBadgeRow">
            <span><ShieldCheck size={14} /> Premium Quality Print</span>
            <span><PenLine size={14} /> Scratch Resistant</span>
            <span>🇮🇳 Made in India</span>
          </div>
        </aside>
      </div>

      <div className="studioQualityStrip">
        <div><Sparkles size={22} /><b>High Quality Print</b><span>Vibrant & Long Lasting</span></div>
        <div><ShieldCheck size={22} /><b>Fade Resistant</b><span>UV Protection</span></div>
        <div><PenLine size={22} /><b>Scratch Proof</b><span>Durable & Reliable</span></div>
        <div><PackageCheck size={22} /><b>Secure Packaging</b><span>Safe Delivery</span></div>
      </div>

      {showHowItWorks && (
        <div className="howModalOverlay" onClick={() => setShowHowItWorks(false)}>
          <div className="howModalBox" onClick={(e) => e.stopPropagation()}>
            <button className="closeHowModal" type="button" onClick={() => setShowHowItWorks(false)}>×</button>
            <span>THE VELTRIXX CUSTOMIZER</span>
            <h2>How It Works?</h2>

            <div className="howStepsGrid">
              <div>
                <b>1</b>
                <h3>Upload or Pick Elements</h3>
                <p>Upload your image, choose professional stickers, add text, shapes and background.</p>
              </div>

              <div>
                <b>2</b>
                <h3>Edit on Case</h3>
                <p>Click any layer on the case to drag, resize, rotate, change font, color or opacity.</p>
              </div>

              <div>
                <b>3</b>
                <h3>Preview & Order</h3>
                <p>Open preview, download your design, save it or directly add it to cart.</p>
              </div>
            </div>

            <button className="goldPreviewBtn" type="button" onClick={() => setShowHowItWorks(false)}>Start Designing</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomizeCase;
