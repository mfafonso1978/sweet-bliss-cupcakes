import { Cupcake } from '../types';

export const initialCupcakes: Cupcake[] = [
  {
    id: 'cup-01',
    name: 'Red Velvet Clássico Gourmet',
    category: 'Gourmet',
    price: 14.50,
    promoPrice: 12.90,
    image: 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?auto=format&fit=crop&w=800&q=80',
    description: 'Massa aveludada de cacau puro com suave toque de baunilha de Madagascar, recheada e coberta com autêntico frosting de cream cheese aerado.',
    ingredients: ['Farinha de trigo especial', 'Cacau em pó alcalino', 'Cream cheese premium', 'Manteiga sem sal', 'Açúcar demerara', 'Ovos frescos'],
    allergens: ['Glúten', 'Lactose', 'Ovos'],
    stock: 18,
    rating: 4.9,
    calories: 320
  },
  {
    id: 'cup-02',
    name: 'Chocolate Belga Trufado 70%',
    category: 'Gourmet',
    price: 15.00,
    image: 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&w=800&q=80',
    description: 'Massa densa e molhada de chocolate nobre, recheio cremoso de ganache artesanal belga 70% cacau e granulado de chocolate belga raspado à mão.',
    ingredients: ['Chocolate belga 70%', 'Creme de leite fresco', 'Farinha de trigo orgânica', 'Cacau Callebaut', 'Açúcar mascavo'],
    allergens: ['Glúten', 'Lactose', 'Ovos'],
    stock: 12,
    rating: 5.0,
    calories: 380
  },
  {
    id: 'cup-03',
    name: 'Frutas Vermelhas & Pistache',
    category: 'Gourmet',
    price: 16.50,
    image: 'https://images.unsplash.com/photo-1587668178277-295251f900ce?auto=format&fit=crop&w=800&q=80',
    description: 'Base aromática de pistache da Sicília com coulis de framboesa fresca, finalizado com buttercream aveludado e pistaches tostados crocantes.',
    ingredients: ['Pistache siciliano triturado', 'Geleia de framboesa e amoras', 'Farinha de trigo', 'Manteiga', 'Ovos'],
    allergens: ['Glúten', 'Lactose', 'Ovos', 'Nozes / Castanhas'],
    stock: 8,
    rating: 4.8,
    calories: 340
  },
  {
    id: 'cup-04',
    name: 'Vegano Flor de Laranja & Mirtilo',
    category: 'Vegano',
    price: 15.50,
    image: 'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?auto=format&fit=crop&w=800&q=80',
    description: 'Totalmente livre de ingredientes de origem animal. Massa leve e úmida infusionada com água de flor de laranjeira, mirtilos frescos e creme de coco batido.',
    ingredients: ['Farinha de aveia sem glúten', 'Leite de amêndoas', 'Mirtilos orgânicos', 'Água de flor de laranjeira', 'Creme de coco orgânico', 'Óleo de coco'],
    allergens: ['Nozes / Castanhas'],
    stock: 14,
    rating: 4.9,
    calories: 260
  },
  {
    id: 'cup-05',
    name: 'Vegano Cacau Supremo & Amêndoas',
    category: 'Vegano',
    price: 14.90,
    promoPrice: 13.50,
    image: 'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?auto=format&fit=crop&w=800&q=80',
    description: 'Massa fofa 100% vegana de cacau alcalino enriquecida com lâminas de amêndoas tostadas e ganache feito à base de chocolate amargo e leite de castanhas.',
    ingredients: ['Farinha de espelta', 'Cacau 100%', 'Açúcar demerara', 'Leite de castanha de caju', 'Lâminas de amêndoa'],
    allergens: ['Glúten', 'Nozes / Castanhas'],
    stock: 10,
    rating: 4.7,
    calories: 290
  },
  {
    id: 'cup-06',
    name: 'Zero Açúcar Ninho & Morango',
    category: 'Zero Açúcar',
    price: 16.00,
    image: 'https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=800&q=80',
    description: 'Adoçado naturalmente com xilitol e estévia pura de alta pureza. Massa de baunilha fofa, recheio de morangos in natura e creme suave sem açúcar adicionado.',
    ingredients: ['Farinha de trigo enriquecida', 'Xilitol premium', 'Estévia', 'Morangos frescos', 'Leite em pó desnatado', 'Ovos'],
    allergens: ['Glúten', 'Lactose', 'Ovos'],
    stock: 9,
    rating: 4.8,
    calories: 195
  },
  {
    id: 'cup-07',
    name: 'Zero Açúcar Doce de Leite Artesanal',
    category: 'Zero Açúcar',
    price: 15.50,
    image: 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?auto=format&fit=crop&w=800&q=80',
    description: 'Massa leve com toque de canela do Ceilão, recheada com doce de leite caseiro sem adição de açúcares refinados, coberto com raspas de canela.',
    ingredients: ['Farinha de aveia', 'Leite integral sem lactose', 'Eritritol e taumatina', 'Canela em pó', 'Ovos orgânicos'],
    allergens: ['Lactose', 'Ovos'],
    stock: 0, // Esgotado momentaneamente
    rating: 4.6,
    calories: 210
  },
  {
    id: 'cup-08',
    name: 'Natalino Especiarias & Nozes Douradas',
    category: 'Sazonais',
    price: 17.50,
    promoPrice: 15.00,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    description: 'Edição Especial de Fim de Ano: Massa aromatizada com noz-moscada, canela e raspas de laranja, com recheio de nozes nobres e cobertura decorada de neve.',
    ingredients: ['Farinha especial', 'Nozes chilenas selecionadas', 'Mix de especiarias natalinas', 'Mel silvestre', 'Glacê real'],
    allergens: ['Glúten', 'Lactose', 'Ovos', 'Nozes / Castanhas'],
    stock: 15,
    rating: 5.0,
    calories: 360
  },
  {
    id: 'cup-09',
    name: 'Sazonal Páscoa Ninho & Cenoura Trufada',
    category: 'Sazonais',
    price: 16.90,
    image: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=800&q=80',
    description: 'Tradicional massa fofinha de bolo de cenoura caseiro, afogada com vulcão de brigadeiro gourmet cremoso e raspas de chocolate ao leite.',
    ingredients: ['Cenouras frescas selecionadas', 'Farinha de trigo', 'Óleo vegetal puro', 'Cacau 50%', 'Leite condensado moça'],
    allergens: ['Glúten', 'Lactose', 'Ovos'],
    stock: 11,
    rating: 4.9,
    calories: 350
  }
];
