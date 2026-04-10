package exma0410;

import java.util.Scanner;

public class StudentScoreManager {
	public static void main(String[] args) {
		Scanner sc = new Scanner(System.in);
		
		System.out.println("학생 이름 : ");
		String name = sc.next();
		
		System.out.println("JAVA 점수 : ");
		int JAVA = sc.nextInt();
		
		System.out.println("DB 점수 : ");
		int DB = sc.nextInt();
		
		System.out.println("HTML 점수 : ");
		int HTML = sc.nextInt();
		
		int sum = JAVA + DB + HTML;
		double avg = sum/3.0;
		
		String result;
		if(avg >= 60) {
			result = "합격";
		}else {
			result = "불합격";
		}
		
		System.out.println("이름: " + name);
		System.out.println("총점: " + sum);
		System.out.println("평균: " + avg);
		System.out.println("결과: " + result);
	}
}
