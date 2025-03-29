
import { Offer } from "@/context/OfferContext";
import { saveAs } from "file-saver";
import { format } from "date-fns";

type Achievement = {
  title: string;
  value: string;
  color: string;
  icon?: string;
};

/**
 * Creates an inspirational image from offer data
 */
export function createInspirationalImage(offers: Offer[], dateRangeText = ''): Promise<string> {
  return new Promise((resolve, reject) => {
    if (offers.length === 0) {
      reject(new Error("No offers to create image from"));
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext("2d");
    
    if (!ctx) {
      reject(new Error("Couldn't create canvas context"));
      return;
    }

    // Calculate achievements
    const achievements = calculateAchievements(offers);
    
    // Make canvas transparent
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw gradient background with transparency
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "rgba(26, 26, 46, 0.85)");
    gradient.addColorStop(1, "rgba(22, 33, 62, 0.85)");
    ctx.fillStyle = gradient;
    
    // Draw rounded rectangle for background
    roundRect(ctx, 0, 0, canvas.width, canvas.height, 20, true);
    
    // Add subtle patterns/effects
    drawPatternEffect(ctx, canvas.width, canvas.height);
    
    // Draw header with glow effect
    drawTextWithGlow(
      ctx, 
      "Offer Tracker Achievements", 
      canvas.width / 2, 
      100, 
      "bold 52px 'Inter', system-ui, sans-serif", 
      "#ffffff", 
      "rgba(120, 120, 255, 0.6)"
    );
    
    // Draw date range subtitle
    const dateRange = dateRangeText 
      ? `Data from ${dateRangeText.replace(/_/g, ' ')}`
      : getDateRangeText(offers);
    
    ctx.font = "32px Inter, system-ui, sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.textAlign = "center";
    ctx.fillText(dateRange, canvas.width / 2, 150);
    
    // Draw achievements with improved styling
    drawAchievements(ctx, achievements, canvas.width, canvas.height);
    
    // Draw decorative elements
    drawDecorativeElements(ctx, canvas.width, canvas.height);
    
    // Draw footer with subtle gradient
    const footerGradient = ctx.createLinearGradient(0, canvas.height - 80, 0, canvas.height);
    footerGradient.addColorStop(0, "rgba(0, 0, 0, 0)");
    footerGradient.addColorStop(1, "rgba(0, 0, 0, 0.2)");
    ctx.fillStyle = footerGradient;
    ctx.fillRect(0, canvas.height - 80, canvas.width, 80);
    
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.font = "18px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Generated on " + format(new Date(), "MMMM d, yyyy"), canvas.width / 2, canvas.height - 40);
    
    // Convert to image
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        resolve(url);
      } else {
        reject(new Error("Failed to create image blob"));
      }
    }, "image/png");
  });
}

/**
 * Draws decorative elements on the canvas
 */
function drawDecorativeElements(ctx: CanvasRenderingContext2D, width: number, height: number) {
  // Draw sparkle effects
  const sparklePositions = [
    { x: width * 0.1, y: height * 0.2 },
    { x: width * 0.9, y: height * 0.3 },
    { x: width * 0.15, y: height * 0.8 },
    { x: width * 0.85, y: height * 0.75 },
  ];
  
  sparklePositions.forEach(pos => {
    drawSparkle(ctx, pos.x, pos.y, 15, 4, "rgba(255, 255, 255, 0.7)");
  });
  
  // Draw decorative lines
  ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
  ctx.lineWidth = 2;
  
  // Top left corner decoration
  ctx.beginPath();
  ctx.moveTo(40, 40);
  ctx.lineTo(140, 40);
  ctx.moveTo(40, 40);
  ctx.lineTo(40, 140);
  ctx.stroke();
  
  // Bottom right corner decoration
  ctx.beginPath();
  ctx.moveTo(width - 40, height - 40);
  ctx.lineTo(width - 140, height - 40);
  ctx.moveTo(width - 40, height - 40);
  ctx.lineTo(width - 40, height - 140);
  ctx.stroke();
}

/**
 * Draws a sparkle effect at the specified position
 */
function drawSparkle(
  ctx: CanvasRenderingContext2D, 
  x: number, 
  y: number, 
  outerRadius: number, 
  innerRadius: number, 
  color: string
) {
  const spikes = 8;
  const rotation = Math.PI / spikes;
  
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  
  for (let i = 0; i < spikes * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = i * Math.PI / spikes;
    
    if (i === 0) {
      ctx.moveTo(
        x + radius * Math.cos(angle + rotation),
        y + radius * Math.sin(angle + rotation)
      );
    } else {
      ctx.lineTo(
        x + radius * Math.cos(angle + rotation),
        y + radius * Math.sin(angle + rotation)
      );
    }
  }
  
  ctx.closePath();
  ctx.stroke();
}

/**
 * Draws pattern effects on the background
 */
function drawPatternEffect(ctx: CanvasRenderingContext2D, width: number, height: number) {
  // Draw subtle grid pattern
  ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
  ctx.lineWidth = 1;
  
  // Vertical lines
  for (let x = 50; x < width; x += 100) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  
  // Horizontal lines
  for (let y = 50; y < height; y += 100) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  
  // Draw a subtle glow in the center
  const radialGradient = ctx.createRadialGradient(
    width / 2, height / 2, 0,
    width / 2, height / 2, width * 0.6
  );
  radialGradient.addColorStop(0, "rgba(100, 120, 255, 0.1)");
  radialGradient.addColorStop(1, "rgba(100, 120, 255, 0)");
  
  ctx.fillStyle = radialGradient;
  ctx.fillRect(0, 0, width, height);
}

/**
 * Draws text with a glow effect
 */
function drawTextWithGlow(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  font: string,
  color: string,
  glowColor: string
) {
  ctx.save();
  
  // Set font
  ctx.font = font;
  ctx.textAlign = "center";
  
  // Draw glow
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 15;
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  
  // Draw text again to make it sharper
  ctx.shadowBlur = 0;
  ctx.fillText(text, x, y);
  
  ctx.restore();
}

/**
 * Saves the inspirational image to the user's device
 */
export async function exportInspirationalImage(offers: Offer[], dateRangeText = ''): Promise<string | undefined> {
  try {
    const imageUrl = await createInspirationalImage(offers, dateRangeText);
    
    // Fetch the blob
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    
    // Generate filename
    const fileName = dateRangeText 
      ? `offer-achievements-${dateRangeText}.png`
      : `offer-achievements-${format(new Date(), 'yyyy-MM-dd')}.png`;
    
    // Save file
    saveAs(blob, fileName);
    
    // Cleanup
    URL.revokeObjectURL(imageUrl);
    
    return fileName;
  } catch (error) {
    console.error("Failed to export image:", error);
    return undefined;
  }
}

/**
 * Calculates achievements from offer data
 */
function calculateAchievements(offers: Offer[]): Achievement[] {
  const achievements: Achievement[] = [];
  
  // Calculate total offers
  achievements.push({
    title: "Total Offers",
    value: offers.length.toString(),
    color: "#4c6ef5",
    icon: "📊"
  });
  
  // Calculate conversion rate
  const convertedOffers = offers.filter(o => o.converted).length;
  const conversionRate = offers.length > 0 
    ? Math.round((convertedOffers / offers.length) * 100) 
    : 0;
  
  achievements.push({
    title: "Conversion Rate",
    value: `${conversionRate}%`,
    color: "#36b9cc",
    icon: "🔄"
  });
  
  // Calculate CSAT
  const positiveCSAT = offers.filter(o => o.csat === 'positive').length;
  const csatRate = offers.length > 0 
    ? Math.round((positiveCSAT / offers.length) * 100) 
    : 0;
  
  achievements.push({
    title: "Positive CSAT",
    value: `${csatRate}%`,
    color: "#1cc88a",
    icon: "😊"
  });
  
  // Get most popular offer type
  const offerTypeCounts = offers.reduce((acc, offer) => {
    acc[offer.offerType] = (acc[offer.offerType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  let topOfferType = '';
  let topOfferCount = 0;
  
  Object.entries(offerTypeCounts).forEach(([type, count]) => {
    if (count > topOfferCount) {
      topOfferType = type;
      topOfferCount = count;
    }
  });
  
  if (topOfferType) {
    const typePercentage = Math.round((topOfferCount / offers.length) * 100);
    
    achievements.push({
      title: "Top Offer Type",
      value: wrapTextIntoMultipleLines(topOfferType, 12),
      color: "#f6c23e",
      icon: "🌟"
    });
    
    achievements.push({
      title: "Success Rate",
      value: `${typePercentage}%`,
      color: "#e74a3b",
      icon: "🎯"
    });
  }
  
  return achievements;
}

/**
 * Wraps text into multiple lines with a maximum character count per line
 */
function wrapTextIntoMultipleLines(text: string, maxCharsPerLine: number): string {
  if (text.length <= maxCharsPerLine) return text;
  
  const words = text.split(' ');
  let result = '';
  let currentLine = '';
  
  words.forEach(word => {
    if ((currentLine + word).length <= maxCharsPerLine) {
      currentLine += (currentLine.length > 0 ? ' ' : '') + word;
    } else {
      result += (result.length > 0 ? '\n' : '') + currentLine;
      currentLine = word;
    }
  });
  
  if (currentLine.length > 0) {
    result += (result.length > 0 ? '\n' : '') + currentLine;
  }
  
  return result;
}

/**
 * Gets a formatted date range text
 */
function getDateRangeText(offers: Offer[]): string {
  if (offers.length === 0) return "";
  
  // Sort offers by date
  const sortedOffers = [...offers].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  const firstOfferDate = new Date(sortedOffers[0].date);
  const lastOfferDate = new Date(sortedOffers[sortedOffers.length - 1].date);
  
  // If same day, just show that day
  if (format(firstOfferDate, 'yyyy-MM-dd') === format(lastOfferDate, 'yyyy-MM-dd')) {
    return format(firstOfferDate, 'MMMM d, yyyy');
  }
  
  // Otherwise show range
  return `${format(firstOfferDate, 'MMM d')} - ${format(lastOfferDate, 'MMM d, yyyy')}`;
}

/**
 * Draws achievement cards on the canvas
 */
function drawAchievements(
  ctx: CanvasRenderingContext2D, 
  achievements: Achievement[],
  canvasWidth: number,
  canvasHeight: number
): void {
  const cardWidth = 210;
  const cardHeight = 210;
  const cardMargin = 20;
  const startY = 200;
  const perRow = Math.min(5, achievements.length);
  
  // Calculate total width of all cards in a row
  const totalRowWidth = perRow * cardWidth + (perRow - 1) * cardMargin;
  let startX = (canvasWidth - totalRowWidth) / 2;
  
  // Draw each achievement card
  achievements.forEach((achievement, index) => {
    const row = Math.floor(index / perRow);
    const col = index % perRow;
    
    const x = startX + (cardWidth + cardMargin) * col;
    const y = startY + (cardHeight + cardMargin) * row;
    
    // Draw card background with glass effect and rounded corners
    ctx.save();
    const cardGradient = ctx.createLinearGradient(x, y, x, y + cardHeight);
    cardGradient.addColorStop(0, `rgba(40, 40, 70, 0.7)`);
    cardGradient.addColorStop(1, `rgba(20, 20, 40, 0.7)`);
    ctx.fillStyle = cardGradient;
    
    // Draw card border
    roundRect(ctx, x, y, cardWidth, cardHeight, 15, true);
    
    // Draw card border glow
    ctx.strokeStyle = `${achievement.color}80`; // 50% opacity
    ctx.lineWidth = 2;
    roundRect(ctx, x, y, cardWidth, cardHeight, 15, false, true);
    
    // Draw card icon if available
    if (achievement.icon) {
      ctx.font = "40px Arial";
      ctx.fillText(achievement.icon, x + cardWidth / 2, y + 55);
    }
    
    // Draw card title
    ctx.font = "bold 22px Inter, system-ui, sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    ctx.textAlign = "center";
    ctx.fillText(achievement.title, x + cardWidth / 2, y + (achievement.icon ? 95 : 65));
    
    // Draw colored accent line
    ctx.fillStyle = achievement.color;
    ctx.fillRect(x + cardWidth / 4, y + (achievement.icon ? 110 : 80), cardWidth / 2, 4);
    
    // Draw value with support for multiline values
    ctx.font = "bold 36px Inter, system-ui, sans-serif";
    ctx.fillStyle = "#ffffff";
    
    const valueLines = achievement.value.split('\n');
    const lineHeight = 38;
    
    if (valueLines.length === 1) {
      // Single line - center it
      ctx.fillText(achievement.value, x + cardWidth / 2, y + (achievement.icon ? 155 : 125));
    } else {
      // Multiple lines - position them accordingly
      const startYPos = y + (achievement.icon ? 140 : 110);
      
      valueLines.forEach((line, i) => {
        ctx.fillText(line, x + cardWidth / 2, startYPos + (i * lineHeight));
      });
    }
    
    ctx.restore();
  });
}

/**
 * Helper function to draw rounded rectangles
 */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fill: boolean,
  stroke: boolean = false
): void {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  if (fill) {
    ctx.fill();
  }
  if (stroke) {
    ctx.stroke();
  }
}
