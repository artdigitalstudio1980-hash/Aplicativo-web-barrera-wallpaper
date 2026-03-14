
interface PictoremConfig {
  apiKey: string;
  baseUrl: string;
}

interface PictoremPreorderCode {
  numCopies: number;
  material: string;
  type: string;
  orientation: string;
  width: number;
  height: number;
  additional?: string[];
}

interface PictoremDeliveryInfo {
  firstname: string;
  lastname: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  province: string;
  country: string;
  cp: string;
  phone?: string;
}

interface PictoremOrderItem {
  code: string;
  fileurl?: string;
  filetype?: string;
  file?: File;
  thanknotemsg?: string;
  bordercolorhex?: string;
  collectionID?: string;
}

interface PictoremPrice {
  status: boolean;
  msg: string[];
  worksheet: {
    enabledDiscount: boolean;
    price: {
      list: {
        main: number;
        cert: number;
      };
      discount: {
        main: number;
        cert: number;
      };
      artistCommission: {
        main: number;
      };
      artistCommissionDiscount: {
        main: number;
      };
      subTotal: number;
      taxes: {
        taxPercentage: number;
        taxGST: number;
        taxPST: number;
      };
      total: number;
    };
  };
}

interface PictoremLeadTime {
  status: boolean;
  msg: string[];
  data: {
    productionLeadTime: number;
  };
}

interface PictoremOrderResponse {
  status: boolean;
  msg: { error?: string[] };
  orderid: string | null;
}

export class PictoremClient {
  private config: PictoremConfig;

  constructor() {
    this.config = {
      apiKey: process.env.PICTOREM_API_KEY || '',
      baseUrl: process.env.PICTOREM_BASE_URL || 'https://www.pictorem.com/artflow'
    };
  }

  private generatePreorderCode(options: PictoremPreorderCode): string {
    const { numCopies, material, type, orientation, width, height, additional = [] } = options;
    const parts = [
      numCopies.toString(),
      material,
      type,
      orientation,
      width.toString(),
      height.toString(),
      ...additional
    ];
    return parts.join('|');
  }

  private async makeRequest(endpoint: string, data: FormData): Promise<any> {
    const headers: HeadersInit = {
      'artFlowKey': this.config.apiKey
    };

    const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: data
    });

    if (!response.ok) {
      throw new Error(`Pictorem API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  async validatePreorder(options: PictoremPreorderCode, borderColorHex = 'ffffff', thankNoteMsg = ''): Promise<any> {
    const formData = new FormData();
    const preorderCode = this.generatePreorderCode(options);
    
    formData.append('preordercode', preorderCode);
    formData.append('bordercolorhex', borderColorHex);
    formData.append('thanknotemsg', thankNoteMsg);

    return this.makeRequest('/validatepreorder/', formData);
  }

  async getPrice(
    options: PictoremPreorderCode, 
    collectionId = '', 
    deliveryProvince = '', 
    deliveryCountry = 'USA'
  ): Promise<PictoremPrice> {
    const formData = new FormData();
    const preorderCode = this.generatePreorderCode(options);
    
    formData.append('preordercode', preorderCode);
    formData.append('collecionid', collectionId);
    formData.append('deliveryprovince', deliveryProvince);
    formData.append('deliverycountry', deliveryCountry);

    return this.makeRequest('/getprice/', formData);
  }

  async getLeadTime(options: PictoremPreorderCode): Promise<PictoremLeadTime> {
    const formData = new FormData();
    const preorderCode = this.generatePreorderCode(options);
    
    formData.append('preordercode', preorderCode);

    return this.makeRequest('/getleadtime/', formData);
  }

  async sendOrder(
    deliveryInfo: PictoremDeliveryInfo,
    orderItems: PictoremOrderItem[],
    orderComment = ''
  ): Promise<PictoremOrderResponse> {
    const formData = new FormData();
    
    // Add order comment
    formData.append('ordercomment', orderComment);
    
    // Add delivery info
    Object.entries(deliveryInfo).forEach(([key, value]) => {
      if (value) {
        formData.append(`deliveryInfo[${key}]`, value);
      }
    });
    
    // Add order items
    orderItems.forEach((item, index) => {
      formData.append(`orderList[${index}][code]`, item.code);
      
      if (item.fileurl) {
        formData.append(`orderList[${index}][fileurl]`, item.fileurl);
        formData.append(`orderList[${index}][filetype]`, item.filetype || 'jpg');
      }
      
      if (item.file) {
        formData.append(`orderList[${index}][file]`, item.file);
      }
      
      if (item.collectionID) {
        formData.append(`orderList[${index}][collectionID]`, item.collectionID);
      }
      
      if (item.thanknotemsg) {
        formData.append(`orderList[${index}][thanknotemsg]`, item.thanknotemsg);
      }
      
      if (item.bordercolorhex) {
        formData.append(`orderList[${index}][bordercolorhex]`, item.bordercolorhex);
      }
    });

    return this.makeRequest('/sendorder/', formData);
  }

  async buildProductList(options: PictoremPreorderCode): Promise<any> {
    const formData = new FormData();
    const preorderCode = this.generatePreorderCode(options);
    
    formData.append('preordercode', preorderCode);

    return this.makeRequest('/buildproductlist/', formData);
  }
}

export const pictoremClient = new PictoremClient();

// Helper functions for Pictorem configuration
export const PICTOREM_MATERIALS = {
  canvas: {
    name: 'Canvas',
    nameEs: 'Lienzo',
    types: ['stretched', 'roll'],
    description: 'High-quality canvas prints',
    descriptionEs: 'Impresiones en lienzo de alta calidad'
  },
  metal: {
    name: 'Metal',
    nameEs: 'Metal',
    types: ['al', 'alw', 'hd', 'hds'],
    description: 'Durable aluminum prints',
    descriptionEs: 'Impresiones duraderas en aluminio'
  },
  acrylic: {
    name: 'Acrylic',
    nameEs: 'Acrílico',
    types: ['da8', 'da16', 'ac4', 'a38', 'ng8'],
    description: 'Modern acrylic glass prints',
    descriptionEs: 'Impresiones modernas en vidrio acrílico'
  },
  paper: {
    name: 'Paper',
    nameEs: 'Papel',
    types: ['poster', 'glossphoto', 'art', 'vinyl'],
    description: 'Various paper print options',
    descriptionEs: 'Varias opciones de impresión en papel'
  },
  wood: {
    name: 'Wood',
    nameEs: 'Madera',
    types: ['ru14', 'pineveneer'],
    description: 'Natural wood prints',
    descriptionEs: 'Impresiones en madera natural'
  }
};

export const PICTOREM_ORIENTATIONS = [
  { value: 'vertical', label: 'Portrait', labelEs: 'Vertical' },
  { value: 'horizontal', label: 'Landscape', labelEs: 'Horizontal' },
  { value: 'square', label: 'Square', labelEs: 'Cuadrado' }
];

export const DEFAULT_PICTOREM_OPTIONS = {
  canvas: {
    material: 'canvas',
    type: 'stretched',
    additional: ['regular', 'bordercolor', 'c15', 'none', 'none', 'none', 'opt']
  },
  metal: {
    material: 'metal',
    type: 'al',
    additional: ['none', 'none', 'none', 'opt']
  },
  acrylic: {
    material: 'acrylic',
    type: 'da8',
    additional: ['none', 'none', 'none', 'opt']
  }
};
