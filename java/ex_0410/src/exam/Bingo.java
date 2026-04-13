package exam;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class Bingo {

    private int[][] bingo = new int[5][5];

    // 생성자 → 빙고판 생성
    public Bingo() {
        Set<Integer> set = new HashSet<>();

        while(set.size() < 25) {
            int ran = (int)(Math.random() * 50) + 1;
            set.add(ran);
        }

        List<Integer> list = new ArrayList<>(set);
        Collections.shuffle(list);

        int index = 0;
        for(int i = 0; i < 5; i++) {
            for(int j = 0; j < 5; j++) {
                bingo[i][j] = list.get(index++);
            }
        }
    }

    // 빙고판 출력
    public void printBoard() {
        for(int i = 0; i < 5; i++) {
            for(int j = 0; j < 5; j++) {
                if(bingo[i][j] == 0) {
                    System.out.print(" X ");
                } else {
                    System.out.printf("%3d ", bingo[i][j]);
                }
            }
            System.out.println();
        }
    }

    // 숫자 체크
    public boolean checkNumber(int number) {
        for(int i = 0; i < 5; i++) {
            for(int j = 0; j < 5; j++) {
                if(bingo[i][j] == number) {
                    bingo[i][j] = 0;
                    return true;
                }
            }
        }
        return false;
    }

    // 빙고 개수 계산
    public int countBingo() {
        int count = 0;

        // 가로
        for(int i = 0; i < 5; i++) {
            boolean isBingo = true;
            for(int j = 0; j < 5; j++) {
                if(bingo[i][j] != 0) {
                    isBingo = false;
                    break;
                }
            }
            if(isBingo) count++;
        }

        // 세로
        for(int i = 0; i < 5; i++) {
            boolean isBingo = true;
            for(int j = 0; j < 5; j++) {
                if(bingo[j][i] != 0) {
                    isBingo = false;
                    break;
                }
            }
            if(isBingo) count++;
        }

        // 대각선 (↘)
        boolean diag1 = true;
        for(int i = 0; i < 5; i++) {
            if(bingo[i][i] != 0) {
                diag1 = false;
                break;
            }
        }
        if(diag1) count++;

        // 대각선 (↙)
        boolean diag2 = true;
        for(int i = 0; i < 5; i++) {
            if(bingo[i][4 - i] != 0) {
                diag2 = false;
                break;
            }
        }
        if(diag2) count++;

        return count;
    }
}