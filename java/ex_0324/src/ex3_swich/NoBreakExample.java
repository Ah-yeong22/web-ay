package ex3_swich;

public class NoBreakExample {
	public static void main(String[] args) {
		int time = 8;
		
		switch(time) {
		case 8:
			System.out.println("출근합니다.");
		case 9:
			System.out.println("회의합니다.");
		case 10:
			System.out.println("업무합니다.");
		default:
			System.out.println("외근을 나갑니다.");
		}
		
		char grade = 'B';
		
		switch(grade) {
		case 'A' :
		case 'a' :
			System.out.println("우수회원");
			break;
		case 'B' :
		case 'b' :
			System.out.println("일반회원");
			break;
		default :
			System.out.println("비회원");
			break;
		}
	}
}
