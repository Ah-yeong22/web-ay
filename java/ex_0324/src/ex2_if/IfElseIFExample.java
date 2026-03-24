package ex2_if;

public class IfElseIFExample {
	public static void main(String[] args) {
		int score =75;
		
		if (score < 0) {
			System.out.println("다시 입력해주세요 : ");
		}else if (score > 100) {
				System.out.println("100 이하");
		}else if (score >= 90) {
			System.out.println("A");
		}else if (score >= 80) { 
			System.out.println("B");
		}else if (score >= 70) {
			System.out.println("C");
		}else if (score >= 60) {
			System.out.println("D");
		}else {
			System.out.println("F");
		}
	}
}
