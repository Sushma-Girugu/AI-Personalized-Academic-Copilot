package com.sushma.githubassistant.service;

public class PdfTextExtractorTest {

    public static void main(String[] args) throws Exception {

        PdfTextExtractor extractor = new PdfTextExtractor();

        String filePath = "C:\\Users\\sushm\\Downloads\\CN_1_to_9_removed.pdf";

        String text = extractor.extractText(filePath);

        System.out.println(text);
    }
}