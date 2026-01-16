
import { GoogleGenAI, Type } from "@google/genai";
import { IncidentReport, AIAnalysis } from "../types";

// Always use named parameter for apiKey and fetch it from process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeIncident = async (report: IncidentReport): Promise<AIAnalysis> => {
  try {
    // Use gemini-3-pro-preview for complex reasoning and psychological analysis
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Phân tích sự cố học đường tại TRƯỜNG PTDTBT THCS THU CÚC:
      Tiêu đề: ${report.title}
      Mô tả: ${report.description}
      Danh mục: ${report.category}
      Vị trí: ${report.location}`,
      config: {
        systemInstruction: `Bạn là một chuyên gia tư vấn tâm lý và an toàn học đường hỗ trợ TRƯỜNG PTDTBT THCS THU CÚC. 
        Nhiệm vụ của bạn là phân tích báo cáo sự cố từ học sinh để hỗ trợ giáo viên và ban giám hiệu.
        Hãy đưa ra phân tích mang tính nhân văn, giáo dục và bảo mật thông tin.
        Tránh các từ ngữ quá nhạy cảm nhưng phải phản ánh đúng mức độ nghiêm trọng.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            urgency: {
              type: Type.STRING,
              enum: ['Thấp', 'Trung bình', 'Cao', 'Khẩn cấp'],
              description: "Mức độ khẩn cấp của sự việc"
            },
            summary: {
              type: Type.STRING,
              description: "Tóm tắt ngắn gọn sự việc"
            },
            suggestedAction: {
              type: Type.STRING,
              description: "Các bước xử lý đề xuất cho nhà trường"
            },
            educationalNote: {
              type: Type.STRING,
              description: "Lời khuyên mang tính giáo dục và nhân văn cho GVCN"
            }
          },
          required: ["urgency", "summary", "suggestedAction", "educationalNote"]
        }
      }
    });

    // Access .text property directly as per guidelines (it is a property, not a method)
    return JSON.parse(response.text?.trim() || "{}") as AIAnalysis;
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return {
      urgency: 'Trung bình',
      summary: 'Không thể tóm tắt tự động.',
      suggestedAction: 'Giáo viên nên trực tiếp xác minh thông tin.',
      educationalNote: 'Luôn lắng nghe học sinh với thái độ cầu thị.'
    };
  }
};
