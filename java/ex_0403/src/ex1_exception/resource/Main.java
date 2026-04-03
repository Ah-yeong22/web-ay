package ex1_exception.resource;

public class Main {

	public static void main(String[] args) {
		try (MyResource res = new MyResource("A")){
			String data = res.read2();
			int value = Integer.parseInt(data);
			
		} catch (Exception e) {
			System.out.println("예외처리 : " + e.getMessage());
		}
	}
}
