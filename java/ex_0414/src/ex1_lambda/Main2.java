package ex1_lambda;

public class Main2 {
	public static void main(String[] args) {
		String text = "This product is currently out of stock.";
		
		TextService ts = new TextService();
		
		String result1 = ts.processText(text, t->t.toUpperCase());
		System.out.println(result1);
		
		String result2 = ts.processText(text, t-> t.replace("out of stock", "in stock"));
		System.out.println(result2);
	}
}
