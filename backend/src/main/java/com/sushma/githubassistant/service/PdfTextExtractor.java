package com.sushma.githubassistant.service;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;

@Service
public class PdfTextExtractor {

    public String extractText(String filePath) throws IOException {

        File file = new File(filePath);

        PDDocument document = Loader.loadPDF(file);

        PDFTextStripper stripper = new PDFTextStripper();

        String text = stripper.getText(document);

        document.close();

        return text;
    }
}