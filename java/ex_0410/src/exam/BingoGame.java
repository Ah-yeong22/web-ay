package exam;

import java.util.Scanner;

public class BingoGame {

    private Bingo bingo;
    private Scanner sc;

    public BingoGame() {
        bingo = new Bingo();
        sc = new Scanner(System.in);
    }

    public void start() {
        System.out.println("빙고 게임을 시작합니다.");

        while(true) {

            // 1. 빙고판 출력
            bingo.printBoard();

            // 2. 입력
            System.out.print("숫자 입력: ");
            int num = sc.nextInt();

            // 3. 체크
            boolean result = bingo.checkNumber(num);

            // 4. 결과 출력
            if(result) {
                System.out.println(num + "를 체크했습니다.");
            } else {
                System.out.println("빙고판에 없는 숫자입니다.");
            }

            // 🔥 현재 빙고 개수 출력
            int count = bingo.countBingo();
            System.out.println("현재 빙고 개수: " + count);

            // 🔥 3빙고 종료
            if(count >= 3) {
                System.out.println("🎉 3빙고 완성! 게임 종료");
                bingo.printBoard();
                break;
            }
        }
    }
}