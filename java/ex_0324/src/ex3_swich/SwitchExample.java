package ex3_swich;

public class SwitchExample {
	public static void main(String[] args) {
		int num = 2;
		switch(num) {
		case 1:
			System.out.println("1 출력");
			break;
		case 2:
			System.out.println("2 출력");
			break;
		case 3 :
			System.out.println("3 출력");
			break;
		default:
			System.out.println("일치하는 조건값 없음");
		}
		
		String s = "홍";
		
		switch(s) {
		case "김" :
			System.out.println("김길동");
			break;
		case "박" :
			System.out.println("박길동");
			break;
		case "홍" :
			System.out.println("홍길동");
			break;
		}
	}
}
