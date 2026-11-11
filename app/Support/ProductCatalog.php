<?php

namespace App\Support;

/**
 * Katalog sparepart dummy (harga perkiraan, hanya untuk data uji).
 * Dipakai oleh ProductFactory dan ReportController (untuk mengenali brand dari nama produk).
 */
class ProductCatalog
{
    /** kata kunci di nama produk => label brand */
    private const BRANDS = [
        'GS'      => 'GS Astra',
        'Denso'   => 'Denso',
        'Aspira'  => 'Aspira',
        'Kayaba'  => 'Kayaba',
        'Evalube' => 'Evalube',
    ];

    public static function brandOf(?string $name): string
    {
        foreach (self::BRANDS as $keyword => $label) {
            if ($name && preg_match('/\b' . preg_quote($keyword, '/') . '\b/i', $name)) {
                return $label;
            }
        }

        return 'Lainnya';
    }

    /** @return array<int, array{brand:string,name:string,description:string,price:int}> */
    public static function items(): array
    {
        $items = [];

        foreach (self::catalog() as $brand => $rows) {
            foreach ($rows as [$name, $description, $price]) {
                $items[] = [
                    'brand'       => $brand,
                    'name'        => $name,
                    'description' => $description,
                    'price'       => $price,
                ];
            }
        }

        return $items;
    }

    private static function catalog(): array
    {
        return [
            'GS Astra' => [
                ['Aki GS Astra GM5Z-3B 12V 5Ah',  'Aki kering motor 12V 5Ah, maintenance free.',  235000],
                ['Aki GS Astra GTZ4V 12V 3Ah',    'Aki kering motor 12V 3Ah, maintenance free.',  185000],
                ['Aki GS Astra GTZ5S 12V 3,5Ah',  'Aki kering motor 12V 3,5Ah, maintenance free.', 205000],
                ['Aki GS Astra GTZ6V 12V 5Ah',    'Aki kering motor 12V 5Ah, maintenance free.',  225000],
                ['Aki GS Astra GTZ7S 12V 6Ah',    'Aki kering motor 12V 6Ah, maintenance free.',  255000],
                ['Aki GS Astra GTZ8V 12V 7Ah',    'Aki kering motor 12V 7Ah, maintenance free.',  295000],
                ['Aki GS Astra NS40Z 12V 35Ah',   'Aki kering mobil 12V 35Ah, maintenance free.', 785000],
                ['Aki GS Astra NS40ZL 12V 35Ah',  'Aki kering mobil 12V 35Ah, kutub kiri.',       805000],
                ['Aki GS Astra NS60 12V 45Ah',    'Aki kering mobil 12V 45Ah, maintenance free.', 985000],
                ['Aki GS Astra NS60L 12V 45Ah',   'Aki kering mobil 12V 45Ah, kutub kiri.',       1005000],
                ['Aki GS Astra N50Z 12V 60Ah',    'Aki kering mobil 12V 60Ah, maintenance free.', 1085000],
                ['Aki GS Astra NS70 12V 65Ah',    'Aki kering mobil 12V 65Ah, maintenance free.', 1195000],
            ],
            'Denso' => [
                ['Busi Denso U20FS-U',            'Busi standar motor.',                          28000],
                ['Busi Denso U22FS-U',            'Busi standar motor.',                          28000],
                ['Busi Denso U24ESR-N',           'Busi motor, elektroda nikel.',                 45000],
                ['Busi Denso U27ESR-N',           'Busi motor, elektroda nikel.',                 45000],
                ['Busi Denso Iridium Power IU22', 'Busi iridium motor, pengapian lebih stabil.',  145000],
                ['Busi Denso Iridium Power IU24', 'Busi iridium motor, pengapian lebih stabil.',  150000],
                ['Busi Denso K16PR-U',            'Busi standar mobil.',                          38000],
                ['Busi Denso K20PR-U',            'Busi standar mobil.',                          38000],
                ['Busi Denso W20EPR-U',           'Busi standar mobil.',                          42000],
                ['Busi Denso Iridium Power IK16', 'Busi iridium mobil.',                          165000],
                ['Busi Denso Iridium Power IK20', 'Busi iridium mobil.',                          170000],
                ['Busi Denso Iridium Power IK22', 'Busi iridium mobil.',                          175000],
            ],
            'Aspira' => [
                ['Wiper Aspira Frameless 14 inci', 'Wiper frameless mobil 14 inci.',   55000],
                ['Wiper Aspira Frameless 16 inci', 'Wiper frameless mobil 16 inci.',   60000],
                ['Wiper Aspira Frameless 18 inci', 'Wiper frameless mobil 18 inci.',   65000],
                ['Wiper Aspira Frameless 20 inci', 'Wiper frameless mobil 20 inci.',   70000],
                ['Wiper Aspira Frameless 22 inci', 'Wiper frameless mobil 22 inci.',   75000],
                ['Wiper Aspira Frameless 24 inci', 'Wiper frameless mobil 24 inci.',   85000],
                ['Wiper Aspira Frameless 26 inci', 'Wiper frameless mobil 26 inci.',   95000],
                ['Wiper Aspira Konvensional 16 inci', 'Wiper konvensional mobil 16 inci.', 35000],
                ['Wiper Aspira Konvensional 18 inci', 'Wiper konvensional mobil 18 inci.', 38000],
                ['Wiper Aspira Konvensional 20 inci', 'Wiper konvensional mobil 20 inci.', 42000],
                ['Wiper Aspira Konvensional 22 inci', 'Wiper konvensional mobil 22 inci.', 45000],
                ['Wiper Aspira Belakang 12 inci',     'Wiper kaca belakang mobil 12 inci.', 40000],
            ],
            'Kayaba' => [
                ['Shock Absorber Kayaba Excel-G Depan Toyota Avanza/Xenia',      'Shock depan mobil (per buah).',  395000],
                ['Shock Absorber Kayaba Excel-G Belakang Toyota Avanza/Xenia',   'Shock belakang mobil (per buah).', 345000],
                ['Shock Absorber Kayaba Excel-G Depan Toyota Kijang Innova',     'Shock depan mobil (per buah).',  575000],
                ['Shock Absorber Kayaba Excel-G Belakang Toyota Kijang Innova',  'Shock belakang mobil (per buah).', 495000],
                ['Shock Absorber Kayaba Excel-G Depan Honda Brio',               'Shock depan mobil (per buah).',  435000],
                ['Shock Absorber Kayaba Excel-G Belakang Honda Brio',            'Shock belakang mobil (per buah).', 385000],
                ['Shock Absorber Kayaba Excel-G Depan Honda Jazz',               'Shock depan mobil (per buah).',  465000],
                ['Shock Absorber Kayaba Excel-G Depan Suzuki Ertiga',            'Shock depan mobil (per buah).',  455000],
                ['Shock Absorber Kayaba Excel-G Belakang Daihatsu Terios/Toyota Rush', 'Shock belakang mobil (per buah).', 425000],
                ['Shock Absorber Kayaba Belakang Honda Beat/Scoopy',             'Shock belakang motor matic.',    245000],
                ['Shock Absorber Kayaba Belakang Honda Vario 125/150',           'Shock belakang motor matic.',    265000],
                ['Shock Absorber Kayaba Belakang Yamaha NMAX',                   'Shock belakang motor matic.',    385000],
            ],
            'Evalube' => [
                ['Oli Evalube Motor 4T 10W-30 0,8 L',      'Oli mesin motor 4 tak, SAE 10W-30.',        48000],
                ['Oli Evalube Motor 4T 10W-40 0,8 L',      'Oli mesin motor 4 tak, SAE 10W-40.',        52000],
                ['Oli Evalube Motor 4T 10W-40 1 L',        'Oli mesin motor 4 tak, SAE 10W-40.',        62000],
                ['Oli Evalube Motor 4T 20W-50 0,8 L',      'Oli mesin motor 4 tak, SAE 20W-50.',        45000],
                ['Oli Evalube Motor 4T 20W-50 1 L',        'Oli mesin motor 4 tak, SAE 20W-50.',        55000],
                ['Oli Evalube Matic 10W-30 0,8 L',         'Oli mesin motor matic, SAE 10W-30.',        54000],
                ['Oli Evalube Matic 10W-40 0,8 L',         'Oli mesin motor matic, SAE 10W-40.',        58000],
                ['Oli Evalube Gardan Matic 0,12 L',        'Oli gardan motor matic.',                   15000],
                ['Oli Evalube Mobil 10W-40 SN 1 L',        'Oli mesin mobil bensin, SAE 10W-40 API SN.', 68000],
                ['Oli Evalube Mobil 10W-40 SN 4 L',        'Oli mesin mobil bensin, SAE 10W-40 API SN.', 255000],
                ['Oli Evalube Mobil 20W-50 SL 4 L',        'Oli mesin mobil bensin, SAE 20W-50 API SL.', 215000],
                ['Oli Evalube Diesel 15W-40 CI-4 5 L',     'Oli mesin mobil diesel, SAE 15W-40 API CI-4.', 310000],
            ],
        ];
    }
}
