 var https = require('https');

(function () {
    const topoJsonURL = "https://gist.githubusercontent.com/glippi/86b8ce8b6db37ab6cacea573440df1b8/raw/45ecc0e8428fb672a133c0af48cd0102a72bb47b/FINAL";

    var filtros = [{
            "colorCon": "0x000000",
            "colorRe": "0xffd333",
            "dato": "1A",
            "des": "",
            "id": "1A",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "22.5"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffd333",
            "dato": "1B",
            "des": "",
            "id": "1B",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "29.4"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffd333",
            "dato": "1C",
            "des": "",
            "id": "1C",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "24.3"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffd333",
            "dato": "1D",
            "des": "",
            "id": "1D",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "25.6"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffd333",
            "dato": "1E",
            "des": "",
            "id": "1E",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "24.5"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffde66",
            "dato": "2A",
            "des": "",
            "id": "2A",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "16.1"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffde66",
            "dato": "2B",
            "des": "",
            "id": "2B",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "13.9"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffde66",
            "dato": "2C",
            "des": "",
            "id": "2C",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "14.6"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffd333",
            "dato": "2D",
            "des": "",
            "id": "2D",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "18.4"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffd333",
            "dato": "2E",
            "des": "",
            "id": "2E",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "17.2"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffd333",
            "dato": "2G",
            "des": "",
            "id": "2G",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "18.4"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffde66",
            "dato": "2H",
            "des": "",
            "id": "2H",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "14.0"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xfff4cc",
            "dato": "2I",
            "des": "",
            "id": "2I",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "12.3"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffd333",
            "dato": "2J",
            "des": "",
            "id": "2J",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "16.9"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffe999",
            "dato": "2K",
            "des": "",
            "id": "2K",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "13.6"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffd333",
            "dato": "3A",
            "des": "",
            "id": "3A",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "19.3"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffde66",
            "dato": "3B",
            "des": "",
            "id": "3B",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "15.8"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffde66",
            "dato": "3C",
            "des": "",
            "id": "3C",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "13.8"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffe999",
            "dato": "3D",
            "des": "",
            "id": "3D",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "12.6"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffe999",
            "dato": "3E",
            "des": "",
            "id": "3E",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "12.7"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xfff4cc",
            "dato": "3G",
            "des": "",
            "id": "3G",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "12.0"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffe999",
            "dato": "3H",
            "des": "",
            "id": "3H",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "13.6"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xfff4cc",
            "dato": "4A",
            "des": "",
            "id": "4A",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "11.3"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffffff",
            "dato": "4B",
            "des": "",
            "id": "4B",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "10.5"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xfff4cc",
            "dato": "4C",
            "des": "",
            "id": "4C",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "12.1"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffde66",
            "dato": "5A",
            "des": "",
            "id": "5A",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "15.8"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffde66",
            "dato": "5B",
            "des": "",
            "id": "5B",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "14.3"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xfff4cc",
            "dato": "5C",
            "des": "",
            "id": "5C",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "11.4"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffe999",
            "dato": "5D",
            "des": "",
            "id": "5D",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "12.5"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffe999",
            "dato": "5E",
            "des": "",
            "id": "5E",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "12.8"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffe999",
            "dato": "6A",
            "des": "",
            "id": "6A",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "12.6"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffd333",
            "dato": "6B",
            "des": "",
            "id": "6B",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "22.0"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffde66",
            "dato": "6C",
            "des": "",
            "id": "6C",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "15.8"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffe999",
            "dato": "6D",
            "des": "",
            "id": "6D",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "12.4"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xfff4cc",
            "dato": "6E",
            "des": "",
            "id": "6E",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "11.5"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xfff4cc",
            "dato": "7A",
            "des": "",
            "id": "7A",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "11.4"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffe999",
            "dato": "7B",
            "des": "",
            "id": "7B",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "12.6"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffffff",
            "dato": "7C",
            "des": "",
            "id": "7C",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "10.9"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffffff",
            "dato": "7D",
            "des": "",
            "id": "7D",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "9.2"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xfff4cc",
            "dato": "7E",
            "des": "",
            "id": "7E",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "11.6"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffffff",
            "dato": "7F",
            "des": "",
            "id": "7F",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "9.6"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffe999",
            "dato": "7G",
            "des": "",
            "id": "7G",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "12.8"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffffff",
            "dato": "8A",
            "des": "",
            "id": "8A",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "8.7"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffffff",
            "dato": "8B",
            "des": "",
            "id": "8B",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "8.9"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffd333",
            "dato": "8C",
            "des": "",
            "id": "8C",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "17.7"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffffff",
            "dato": "8D",
            "des": "",
            "id": "8D",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "9.9"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffde66",
            "dato": "8E",
            "des": "",
            "id": "8E",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "14.7"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffffff",
            "dato": "8F",
            "des": "",
            "id": "8F",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "10.0"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xfff4cc",
            "dato": "8G",
            "des": "",
            "id": "8G",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "11.4"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffe999",
            "dato": "8H",
            "des": "",
            "id": "8H",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "12.9"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffd333",
            "dato": "8I",
            "des": "",
            "id": "8I",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "16.9"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xfff4cc",
            "dato": "8J",
            "des": "",
            "id": "8J",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "12.1"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffffff",
            "dato": "9A",
            "des": "",
            "id": "9A",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "10.1"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffe999",
            "dato": "9C",
            "des": "",
            "id": "9C",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "12.4"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xfff4cc",
            "dato": "9E",
            "des": "",
            "id": "9E",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "12.3"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffffff",
            "dato": "9F",
            "des": "",
            "id": "9F",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "11.1"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffffff",
            "dato": "9H",
            "des": "",
            "id": "9H",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "11.1"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xfff4cc",
            "dato": "9I",
            "des": "",
            "id": "9I",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "12.2"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffde66",
            "dato": "10A",
            "des": "",
            "id": "10A",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "14.6"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffe999",
            "dato": "10B",
            "des": "",
            "id": "10B",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "13.5"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffe999",
            "dato": "10C",
            "des": "",
            "id": "10C",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "13.0"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffde66",
            "dato": "10D",
            "des": "",
            "id": "10D",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "14.4"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xfff4cc",
            "dato": "10E",
            "des": "",
            "id": "10E",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "12.1"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffe999",
            "dato": "10F",
            "des": "",
            "id": "10F",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "13.4"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xfff4cc",
            "dato": "10G",
            "des": "",
            "id": "10G",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "11.8"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffffff",
            "dato": "10H",
            "des": "",
            "id": "10H",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "10.3"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffffff",
            "dato": "10I",
            "des": "",
            "id": "10I",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "9.9"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffffff",
            "dato": "10J",
            "des": "",
            "id": "10J",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "9.6"
        },



        {
            "colorCon": "0x000000",
            "colorRe": "0xffd333",
            "dato": "1A",
            "des": "",
            "id": "1A",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "18.7"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffd333",
            "dato": "1B",
            "des": "",
            "id": "1B",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "22.1"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffd333",
            "dato": "1C",
            "des": "",
            "id": "1C",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "19.0"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffd333",
            "dato": "1D",
            "des": "",
            "id": "1D",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "27.2"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffd333",
            "dato": "1E",
            "des": "",
            "id": "1E",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "29.2"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffde66",
            "dato": "2A",
            "des": "",
            "id": "2A",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "15.9"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffe999",
            "dato": "2B",
            "des": "",
            "id": "2B",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "15.0"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffe999",
            "dato": "2C",
            "des": "",
            "id": "2C",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "14.1"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffde66",
            "dato": "2D",
            "des": "",
            "id": "2D",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "16.5"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffde66",
            "dato": "2E",
            "des": "",
            "id": "2E",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "15.8"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffd333",
            "dato": "2G",
            "des": "",
            "id": "2G",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "17.9"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xfff4cc",
            "dato": "2H",
            "des": "",
            "id": "2H",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "13.8"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffe999",
            "dato": "2I",
            "des": "",
            "id": "2I",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "14.1"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffd333",
            "dato": "2J",
            "des": "",
            "id": "2J",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "17.9"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffde66",
            "dato": "2K",
            "des": "",
            "id": "2K",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "16.2"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffd333",
            "dato": "3A",
            "des": "",
            "id": "3A",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "19.2"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffd333",
            "dato": "3B",
            "des": "",
            "id": "3B",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "19.4"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xfff4cc",
            "dato": "3C",
            "des": "",
            "id": "3C",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "13.1"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xfff4cc",
            "dato": "3D",
            "des": "",
            "id": "3D",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "13.5"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffe999",
            "dato": "3E",
            "des": "",
            "id": "3E",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "14.6"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffde66",
            "dato": "3G",
            "des": "",
            "id": "3G",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "15.9"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffde66",
            "dato": "3H",
            "des": "",
            "id": "3H",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "16.7"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xfff4cc",
            "dato": "4A",
            "des": "",
            "id": "4A",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "14.0"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffffff",
            "dato": "4B",
            "des": "",
            "id": "4B",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "11.6"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffffff",
            "dato": "4C",
            "des": "",
            "id": "4C",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "12.2"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xfff4cc",
            "dato": "5A",
            "des": "",
            "id": "5A",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "13.3"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffe999",
            "dato": "5B",
            "des": "",
            "id": "5B",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "14.2"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffffff",
            "dato": "5C",
            "des": "",
            "id": "5C",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "12.0"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffffff",
            "dato": "5D",
            "des": "",
            "id": "5D",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "12.3"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffffff",
            "dato": "5E",
            "des": "",
            "id": "5E",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "11.6"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffe999",
            "dato": "6A",
            "des": "",
            "id": "6A",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "14.6"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffd333",
            "dato": "6B",
            "des": "",
            "id": "6B",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "19.5"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffd333",
            "dato": "6C",
            "des": "",
            "id": "6C",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "18.8"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffe999",
            "dato": "6D",
            "des": "",
            "id": "6D",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "14.1"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xfff4cc",
            "dato": "6E",
            "des": "",
            "id": "6E",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "13.5"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffe999",
            "dato": "7A",
            "des": "",
            "id": "7A",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "14.8"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffe999",
            "dato": "7B",
            "des": "",
            "id": "7B",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "14.1"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffe999",
            "dato": "7C",
            "des": "",
            "id": "7C",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "15.2"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffffff",
            "dato": "7D",
            "des": "",
            "id": "7D",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "11.7"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xfff4cc",
            "dato": "7E",
            "des": "",
            "id": "7E",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "12.9"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffffff",
            "dato": "7F",
            "des": "",
            "id": "7F",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "12.3"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xfff4cc",
            "dato": "7G",
            "des": "",
            "id": "7G",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "12.9"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffffff",
            "dato": "8A",
            "des": "",
            "id": "8A",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "12.1"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffde66",
            "dato": "8B",
            "des": "",
            "id": "8B",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "16.0"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffd333",
            "dato": "8C",
            "des": "",
            "id": "8C",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "18.0"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffffff",
            "dato": "8D",
            "des": "",
            "id": "8D",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "12.6"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffde66",
            "dato": "8E",
            "des": "",
            "id": "8E",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "17.1"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffe999",
            "dato": "8F",
            "des": "",
            "id": "8F",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "14.6"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffe999",
            "dato": "8G",
            "des": "",
            "id": "8G",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "14.6"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffffff",
            "dato": "8H",
            "des": "",
            "id": "8H",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "12.7"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffd333",
            "dato": "8I",
            "des": "",
            "id": "8I",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "19.6"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xfff4cc",
            "dato": "8J",
            "des": "",
            "id": "8J",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "12.9"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffffff",
            "dato": "9A",
            "des": "",
            "id": "9A",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "12.1"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xfff4cc",
            "dato": "9C",
            "des": "",
            "id": "9C",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "13.6"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffde66",
            "dato": "9E",
            "des": "",
            "id": "9E",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "15.6"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffde66",
            "dato": "9F",
            "des": "",
            "id": "9F",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "17.3"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xfff4cc",
            "dato": "9H",
            "des": "",
            "id": "9H",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "13.8"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffe999",
            "dato": "9I",
            "des": "",
            "id": "9I",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "14.2"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffe999",
            "dato": "10A",
            "des": "",
            "id": "10A",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "14.9"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffffff",
            "dato": "10B",
            "des": "",
            "id": "10B",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "12.6"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffde66",
            "dato": "10C",
            "des": "",
            "id": "10C",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "16.0"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xfff4cc",
            "dato": "10D",
            "des": "",
            "id": "10D",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "13.7"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffe999",
            "dato": "10E",
            "des": "",
            "id": "10E",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "15.2"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffde66",
            "dato": "10F",
            "des": "",
            "id": "10F",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "16.1"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xfff4cc",
            "dato": "10G",
            "des": "",
            "id": "10G",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "13.8"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xfff4cc",
            "dato": "10H",
            "des": "",
            "id": "10H",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "13.7"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffffff",
            "dato": "10I",
            "des": "",
            "id": "10I",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "10.8"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffffff",
            "dato": "10J",
            "des": "",
            "id": "10J",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "10.1"
        },


        {
            "colorCon": "0x000000",
            "colorRe": "0xffd333",
            "dato": "1A",
            "des": "",
            "id": "1A",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "31.7"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffde66",
            "dato": "1B",
            "des": "",
            "id": "1B",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "24.4"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffd333",
            "dato": "1C",
            "des": "",
            "id": "1C",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "30.2"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffd333",
            "dato": "1D",
            "des": "",
            "id": "1D",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "31.7"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffd333",
            "dato": "1E",
            "des": "",
            "id": "1E",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "32.3"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffffff",
            "dato": "2A",
            "des": "",
            "id": "2A",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "20.3"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xfff4cc",
            "dato": "2B",
            "des": "",
            "id": "2B",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "20.4"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffe999",
            "dato": "2C",
            "des": "",
            "id": "2C",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "22.2"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffe999",
            "dato": "2D",
            "des": "",
            "id": "2D",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "24.1"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffde66",
            "dato": "2E",
            "des": "",
            "id": "2E",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "25.1"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffe999",
            "dato": "2G",
            "des": "",
            "id": "2G",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "23.2"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffe999",
            "dato": "2H",
            "des": "",
            "id": "2H",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "22.5"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffe999",
            "dato": "2I",
            "des": "",
            "id": "2I",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "23.3"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffe999",
            "dato": "2J",
            "des": "",
            "id": "2J",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "23.4"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xfff4cc",
            "dato": "2K",
            "des": "",
            "id": "2K",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "20.5"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffd333",
            "dato": "3A",
            "des": "",
            "id": "3A",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "26.4"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xfff4cc",
            "dato": "3B",
            "des": "",
            "id": "3B",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "22.0"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffd333",
            "dato": "3C",
            "des": "",
            "id": "3C",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "27.0"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xfff4cc",
            "dato": "3D",
            "des": "",
            "id": "3D",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "21.9"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffd333",
            "dato": "3E",
            "des": "",
            "id": "3E",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "26.4"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffffff",
            "dato": "3G",
            "des": "",
            "id": "3G",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "17.9"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffde66",
            "dato": "3H",
            "des": "",
            "id": "3H",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "25.9"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xfff4cc",
            "dato": "4A",
            "des": "",
            "id": "4A",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "21.9"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xfff4cc",
            "dato": "4B",
            "des": "",
            "id": "4B",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "21.1"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffffff",
            "dato": "4C",
            "des": "",
            "id": "4C",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "20.3"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffe999",
            "dato": "5A",
            "des": "",
            "id": "5A",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "22.7"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffffff",
            "dato": "5B",
            "des": "",
            "id": "5B",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "19.5"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffffff",
            "dato": "5C",
            "des": "",
            "id": "5C",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "14.7"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffffff",
            "dato": "5D",
            "des": "",
            "id": "5D",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "13.6"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xfff4cc",
            "dato": "5E",
            "des": "",
            "id": "5E",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "20.9"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffe999",
            "dato": "6A",
            "des": "",
            "id": "6A",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "23.6"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffde66",
            "dato": "6B",
            "des": "",
            "id": "6B",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "26.0"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffe999",
            "dato": "6C",
            "des": "",
            "id": "6C",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "24.1"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffffff",
            "dato": "6D",
            "des": "",
            "id": "6D",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "20.2"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffffff",
            "dato": "6E",
            "des": "",
            "id": "6E",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "18.8"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffe999",
            "dato": "7A",
            "des": "",
            "id": "7A",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "22.2"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffffff",
            "dato": "7B",
            "des": "",
            "id": "7B",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "14.4"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xfff4cc",
            "dato": "7C",
            "des": "",
            "id": "7C",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "21.2"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xfff4cc",
            "dato": "7D",
            "des": "",
            "id": "7D",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "20.6"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffde66",
            "dato": "7E",
            "des": "",
            "id": "7E",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "24.3"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xfff4cc",
            "dato": "7F",
            "des": "",
            "id": "7F",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "20.7"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffd333",
            "dato": "7G",
            "des": "",
            "id": "7G",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "28.2"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffde66",
            "dato": "8A",
            "des": "",
            "id": "8A",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "24.2"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffd333",
            "dato": "8B",
            "des": "",
            "id": "8B",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "27.7"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffffff",
            "dato": "8C",
            "des": "",
            "id": "8C",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "19.4"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffd333",
            "dato": "8D",
            "des": "",
            "id": "8D",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "29.4"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffe999",
            "dato": "8E",
            "des": "",
            "id": "8E",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "23.8"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffe999",
            "dato": "8F",
            "des": "",
            "id": "8F",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "22.7"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffe999",
            "dato": "8G",
            "des": "",
            "id": "8G",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "24.1"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffe999",
            "dato": "8H",
            "des": "",
            "id": "8H",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "22.2"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffd333",
            "dato": "8I",
            "des": "",
            "id": "8I",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "27.0"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xfff4cc",
            "dato": "8J",
            "des": "",
            "id": "8J",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "20.7"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffffff",
            "dato": "9A",
            "des": "",
            "id": "9A",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "18.3"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffde66",
            "dato": "9C",
            "des": "",
            "id": "9C",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "24.9"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffde66",
            "dato": "9E",
            "des": "",
            "id": "9E",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "25.2"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffffff",
            "dato": "9F",
            "des": "",
            "id": "9F",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "14.8"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffd333",
            "dato": "9H",
            "des": "",
            "id": "9H",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "26.7"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffffff",
            "dato": "9I",
            "des": "",
            "id": "9I",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "16.8"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xfff4cc",
            "dato": "10A",
            "des": "",
            "id": "10A",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "20.9"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffffff",
            "dato": "10B",
            "des": "",
            "id": "10B",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "20.2"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffde66",
            "dato": "10C",
            "des": "",
            "id": "10C",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "24.9"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xfff4cc",
            "dato": "10D",
            "des": "",
            "id": "10D",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "21.6"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffd333",
            "dato": "10E",
            "des": "",
            "id": "10E",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "30.5"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffde66",
            "dato": "10F",
            "des": "",
            "id": "10F",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "25.9"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffe999",
            "dato": "10G",
            "des": "",
            "id": "10G",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "23.0"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffe999",
            "dato": "10H",
            "des": "",
            "id": "10H",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "22.3"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffde66",
            "dato": "10I",
            "des": "",
            "id": "10I",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "25.7"
        },
        {
            "colorCon": "0x000000",
            "colorRe": "0xffffff",
            "dato": "10J",
            "des": "",
            "id": "10J",
            "opaCo": "25",
            "opaRe": "100",
            "textoHTML": "18.2"
        }
    ]
 
    function groupBy(collection, property) {
        var i = 0,
            val, index,
            values = [],
            result = [];
        for (; i < collection.length; i++) {
            val = collection[i][property];
            index = values.indexOf(val);
            if (index > -1)
                result[index].push(collection[i]);
            else {
                values.push(val);
                result.push([collection[i]]);
            }
        }
        return result;
    }

    function addTooltipsIntoProperties(json, id, tooltip) {
        var geometriesCount = json.objects.ABS_2018.geometries.length;

        for (let index = 0; index < geometriesCount; index++) {
            const geometry = json.objects.ABS_2018.geometries[index];

            if(geometry.properties.NOMABS.includes(id)) {
                geometry.properties["TOOLTIPS"] = tooltip;
            }
        }
    }

    var grouped = groupBy(filtros, "id");

    var json;

    https.get(topoJsonURL,
        (res) => {      
            var response = '';

            res.on('data', (chunk) => {
                
                response += chunk;

            });

            res.on('end', function(){
                json = JSON.parse(response);
                function createJson(item) {
                    var id = item[0].id ;
                    const tooltip = [parseFloat(item[0].textoHTML), parseFloat(item[1].textoHTML), parseFloat(item[2].textoHTML)];

                    addTooltipsIntoProperties(json, id, tooltip);
                }

                grouped.map(createJson);
                
                console.log(JSON.stringify(json));
            });
    })
    .on('error', (e) => {
        console.error(e);
      });
})();