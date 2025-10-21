// Prevent duplicate declaration if script loads twice
if (typeof translations === 'undefined') {
  var translations = {
    "firstName": {
      "EN-US": "First Name",
      "DE": "Vorname",
      "ZH": "名字"
    },
    "lastName": {
      "EN-US": "Last Name",
      "DE": "Nachname",
      "ZH": "姓氏"
    },
    "email": {
      "EN-US": "Email",
      "DE": "E-Mail",
      "ZH": "电子邮件"
    },
    "phone": {
      "EN-US": "Phone number (Optional)",
      "DE": "Telefonnummer (Optional)",
      "ZH": "电话号码（可选）"
    },
    "company": {
      "EN-US": "Company name",
      "DE": "Firmenname",
      "ZH": "公司名称"
    },
    "country": {
      "EN-US": "Country",
      "DE": "Land",
      "ZH": "国家"
    },
    "yourInquiry": {
      "EN-US": "Your inquiry",
      "DE": "Ihre Anfrage",
      "ZH": "您的询问"
    },
    "business": {
      "EN-US": "Business",
      "DE": "Geschäft",
      "ZH": "业务"
    },
    "inquiryType": {
      "EN-US": "Inquiry type",
      "DE": "Anfrageart",
      "ZH": "询问类型"
    },
    "inquiry": {
      "EN-US": "Inquiry",
      "DE": "Anfrage",
      "ZH": "询问"
    },
    "inquiryMessage": {
      "EN-US": "Message",
      "DE": "Nachricht",
      "ZH": "留言"
    },
    "newsletter": {
      "EN-US": "Subscribe to newsletter",
      "DE": "Newsletter abonnieren",
      "ZH": "订阅新闻通讯"
    },
    "sendMessage": {
      "EN-US": "Send message",
      "DE": "Nachricht senden",
      "ZH": "发送消息"
    },
    "select": {
      "EN-US": "I understand that my personal data will be processed for the purpose of receiving emails under Article 6(1)(a) of the GDPR, as outlined in the Privacy Policy.",
      "DE": "Ich verstehe, dass meine persönlichen Daten zum Zweck des Empfangs von E-Mails gemäß Artikel 6(1)(a) der DSGVO verarbeitet werden, wie in der Datenschutzerklärung dargelegt.",
      "ZH": "我理解我的个人数据将根据 GDPR 第 6(1)(a) 条的规定被处理，用于接收电子邮件，如隐私政策中所述。"
    }
  };
} else {
  console.warn('Translations already loaded, skipping redeclaration');
}
