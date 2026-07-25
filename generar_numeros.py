#!/usr/bin/env python3
"""
Script para generar un archivo de texto con números desde 1111111 hasta 9999999.
Cada número se escribe en una línea separada.
"""

def generar_archivo_numeros(ruta_archivo):
    """
    Genera un archivo de texto con números desde 1111111 hasta 9999999.

    Args:
        ruta_archivo (str): Ruta del archivo de salida.
    """
    inicio = 1111111
    fin = 9999999

    with open(ruta_archivo, 'w') as archivo:
        for numero in range(inicio, fin + 1):
            archivo.write(f"{numero}\n")

    print(f"Archivo generado exitosamente: {ruta_archivo}")

if __name__ == "__main__":
    archivo_salida = "numeros.txt"
    generar_archivo_numeros(archivo_salida)