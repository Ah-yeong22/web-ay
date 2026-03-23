package ex3_print;

import java.util.Scanner;

public class ScannerExample {
	public static void main(String[] args) {

		Scanner sc = new Scanner(System.in);

		String name;
		int age;
		String address;
		double height;

		System.out.print("이름 : ");
		name = sc.next();  // 문자열 입력

		System.out.print("나이 : ");
		age = sc.nextInt();

		System.out.print("주소 : ");
		address = sc.next();  // 간단 입력 (공백 포함하려면 nextLine)

		System.out.print("키 : ");
		height = sc.nextDouble();

		System.out.printf("당신의 나이는 %d세입니다.\n", age);
		System.out.printf("당신의 이름은 %s입니다.\n", name);
		System.out.printf("당신의 주소는 %s입니다.\n", address);
		System.out.printf("당신의 키는 %.1fcm입니다.\n", height);
	}
}
