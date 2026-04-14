package ex1_lambda;

public class TextService {
	
	public String processText(String text,StringProcessor processor) {
		
		return processor.process(text);
	}
}
