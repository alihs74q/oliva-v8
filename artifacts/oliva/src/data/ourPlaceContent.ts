/**
 * ourPlaceContent.ts
 * ─────────────────
 * Single source of truth for the "Our Place" cinematic page.
 * Edit titles, subtitles, descriptions, image paths and alt text here
 * without touching any layout or animation code.
 */

export interface OurPlaceImage {
  src: string;          // absolute public path e.g. '/cappuccino.jpeg'
  alt: string;
  /** starting edge — where the image enters from */
  enter: 'left' | 'right' | 'top' | 'bottom';
  /** rough position on screen (percent of viewport) */
  style: {
    top?: string; bottom?: string;
    left?: string; right?: string;
    width: string;      // e.g. 'clamp(200px,28vw,360px)'
    maxWidth?: string;
    aspectRatio: string; // e.g. '4/3'
    rotate: number;     // degrees
    zIndex?: number;
  };
}

export interface OurPlaceScene {
  id: string;
  /** Top line of headline */
  titleTop: string;
  /** Bottom line of headline — can be empty */
  titleBottom: string;
  /** Short atmospheric subtitle below headline */
  subtitle: string;
  /** Optional second line of body copy */
  body?: string;
  /** Navigation dot label */
  label: string;
  images: OurPlaceImage[];
}

export const ourPlaceContent: { scenes: OurPlaceScene[] } = {
  scenes: [
    {
      id: 'our-place',
      titleTop: 'OUR',
      titleBottom: 'PLACE',
      subtitle: 'A grove, two courts,\nand the slowest afternoon you\'ve ever had.',
      label: 'Our Place',
      images: [
        {
          src: '/cappuccino.jpeg',
          alt: 'Cappuccino at Oliva',
          enter: 'left',
          style: {
            top: '-2%', left: '-4%',
            width: 'clamp(180px,26vw,340px)',
            aspectRatio: '3/4',
            rotate: -7, zIndex: 2,
          },
        },
        {
          src: '/images/products/OlivaFrappe.jpg',
          alt: 'Oliva signature frappe',
          enter: 'right',
          style: {
            top: '12%', right: '-3%',
            width: 'clamp(160px,22vw,300px)',
            aspectRatio: '3/4',
            rotate: 6, zIndex: 3,
          },
        },
        {
          src: '/caramel-frappuccino.jpg',
          alt: 'Caramel frappuccino',
          enter: 'bottom',
          style: {
            bottom: '-5%', left: '12%',
            width: 'clamp(150px,20vw,280px)',
            aspectRatio: '4/5',
            rotate: 4, zIndex: 2,
          },
        },
        {
          src: '/images/products/IcedMochaLatte.jpg',
          alt: 'Iced mocha latte',
          enter: 'top',
          style: {
            top: '-6%', right: '20%',
            width: 'clamp(120px,16vw,220px)',
            aspectRatio: '3/4',
            rotate: -3, zIndex: 1,
          },
        },
      ],
    },

    {
      id: 'more-than-cafe',
      titleTop: 'MORE THAN',
      titleBottom: 'A CAFÉ',
      subtitle: 'Where every cup tells a story\nand every moment becomes a memory.',
      label: 'More Than a Café',
      images: [
        {
          src: '/images/products/Cappuccino.jpg',
          alt: 'Cappuccino',
          enter: 'right',
          style: {
            top: '4%', right: '-5%',
            width: 'clamp(200px,30vw,380px)',
            aspectRatio: '4/3',
            rotate: 5, zIndex: 2,
          },
        },
        {
          src: '/images/products/IcedMatchaLatte.jpg',
          alt: 'Iced matcha latte',
          enter: 'left',
          style: {
            bottom: '6%', left: '-3%',
            width: 'clamp(160px,22vw,300px)',
            aspectRatio: '3/4',
            rotate: -5, zIndex: 3,
          },
        },
        {
          src: '/cafe-latte.png',
          alt: 'Café latte',
          enter: 'top',
          style: {
            top: '-4%', left: '18%',
            width: 'clamp(120px,15vw,200px)',
            aspectRatio: '1/1',
            rotate: 8, zIndex: 1,
          },
        },
        {
          src: '/images/products/CaramelMacchiato.jpg',
          alt: 'Caramel macchiato',
          enter: 'bottom',
          style: {
            bottom: '-4%', right: '15%',
            width: 'clamp(130px,18vw,240px)',
            aspectRatio: '3/4',
            rotate: -4, zIndex: 2,
          },
        },
      ],
    },

    {
      id: 'coffee-padel-moments',
      titleTop: 'COFFEE · PADEL',
      titleBottom: 'MOMENTS',
      subtitle: 'Two courts. Full menu. Zero rush.',
      body: 'Play hard, sip slow.',
      label: 'Coffee · Padel',
      images: [
        {
          src: '/images/products/LotusMilkshake.jpg',
          alt: 'Lotus milkshake',
          enter: 'left',
          style: {
            top: '8%', left: '-4%',
            width: 'clamp(170px,24vw,320px)',
            aspectRatio: '3/4',
            rotate: -6, zIndex: 2,
          },
        },
        {
          src: '/images/products/ChocolateCake.jpg',
          alt: 'Chocolate cake at Oliva',
          enter: 'right',
          style: {
            top: '2%', right: '-4%',
            width: 'clamp(200px,28vw,360px)',
            aspectRatio: '4/3',
            rotate: 6, zIndex: 3,
          },
        },
        {
          src: '/images/products/HotChocolate.jpg',
          alt: 'Hot chocolate',
          enter: 'bottom',
          style: {
            bottom: '-3%', right: '10%',
            width: 'clamp(140px,18vw,240px)',
            aspectRatio: '3/4',
            rotate: -4, zIndex: 1,
          },
        },
        {
          src: '/choconut-milkshake.png',
          alt: 'Choconut milkshake',
          enter: 'top',
          style: {
            top: '-5%', left: '22%',
            width: 'clamp(110px,14vw,190px)',
            aspectRatio: '1/1',
            rotate: 5, zIndex: 1,
          },
        },
      ],
    },

    {
      id: 'see-you-at-oliva',
      titleTop: 'SEE YOU',
      titleBottom: 'AT OLIVA',
      subtitle: 'Book a court. Order something cold.\nStay longer than planned.',
      label: 'See You Soon',
      images: [
        {
          src: '/images/products/OreoCheesecake.jpg',
          alt: 'Oreo cheesecake at Oliva',
          enter: 'right',
          style: {
            top: '5%', right: '-4%',
            width: 'clamp(180px,26vw,340px)',
            aspectRatio: '3/4',
            rotate: 5, zIndex: 2,
          },
        },
        {
          src: '/images/products/ToffeeNutFrappe.jpg',
          alt: 'Toffee nut frappe',
          enter: 'left',
          style: {
            top: '-3%', left: '-3%',
            width: 'clamp(160px,22vw,300px)',
            aspectRatio: '3/4',
            rotate: -6, zIndex: 3,
          },
        },
        {
          src: '/images/products/Fondant.jpg',
          alt: 'Chocolate fondant',
          enter: 'bottom',
          style: {
            bottom: '-6%', left: '14%',
            width: 'clamp(150px,20vw,280px)',
            aspectRatio: '4/3',
            rotate: 4, zIndex: 2,
          },
        },
        {
          src: '/images/products/RaspberryCheesecake.jpg',
          alt: 'Raspberry cheesecake',
          enter: 'top',
          style: {
            top: '-4%', right: '20%',
            width: 'clamp(120px,16vw,210px)',
            aspectRatio: '3/4',
            rotate: -3, zIndex: 1,
          },
        },
      ],
    },
  ],
};
